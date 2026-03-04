'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type ActionItem = {
  id: string
  title: string
  what: string
  who: string
  dod: string
  dueDate: string
  isCompleted: boolean
  completedAt: string | null
  projectId: string
  project: { name: string }
}

type Project = {
  id: string
  name: string
}

function isOverdue(item: ActionItem) {
  if (item.isCompleted) return false
  return new Date(item.dueDate) < new Date()
}

function getDaysOverdue(item: ActionItem) {
  if (!isOverdue(item)) return 0
  return Math.floor((Date.now() - new Date(item.dueDate).getTime()) / (1000 * 60 * 60 * 24))
}

function ActionItemsContent() {
  const searchParams = useSearchParams()
  const projectIdFilter = searchParams.get('projectId')

  const [items, setItems] = useState<ActionItem[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<ActionItem & { dueDate: string }>>({})
  const [form, setForm] = useState({
    projectId: projectIdFilter || '',
    title: '',
    what: '',
    who: '',
    dod: '',
    dueDate: '',
  })
  const [formError, setFormError] = useState('')

  const load = () => {
    const params = new URLSearchParams()
    if (projectIdFilter) params.set('projectId', projectIdFilter)
    if (showCompleted) params.set('showCompleted', 'true')
    fetch(`/api/action-items?${params}`).then(r => r.json()).then(data => {
      setItems(data)
      setLoading(false)
    })
    fetch('/api/projects').then(r => r.json()).then(setProjects)
  }

  useEffect(load, [projectIdFilter, showCompleted])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (form.dod.length < 10) {
      setFormError('DoD 必须不少于10个字')
      return
    }
    const res = await fetch('/api/action-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { load(); setShowForm(false); setForm(f => ({ ...f, title: '', what: '', who: '', dod: '', dueDate: '' })) }
    else {
      const err = await res.json()
      setFormError(err.error)
    }
  }

  const handleComplete = async (id: string, isCompleted: boolean) => {
    await fetch(`/api/action-items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted }),
    })
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除?')) return
    await fetch(`/api/action-items/${id}`, { method: 'DELETE' })
    load()
  }

  const startEdit = (item: ActionItem) => {
    setEditingId(item.id)
    setEditValues({
      title: item.title,
      what: item.what,
      who: item.who,
      dod: item.dod,
      dueDate: item.dueDate.split('T')[0],
    })
  }

  const saveEdit = async (id: string) => {
    if (editValues.dod && editValues.dod.length < 10) {
      alert('DoD 必须不少于10个字')
      return
    }
    await fetch(`/api/action-items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editValues),
    })
    setEditingId(null)
    load()
  }

  if (loading) return <div className="text-center p-8 text-slate-500">加载中...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">✅ 任务池 (Action Items)</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={e => setShowCompleted(e.target.checked)}
              className="rounded"
            />
            显示已完成
          </label>
          <button
            onClick={() => setShowForm(true)}
            className="bg-slate-800 text-white px-3 py-1.5 text-sm rounded hover:bg-slate-700"
          >
            + 新增任务
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[520px] shadow-xl">
            <h2 className="font-bold mb-4">新增任务</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">所属项目 *</label>
                <select
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                  value={form.projectId}
                  onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
                  required
                >
                  <option value="">请选择项目</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">任务标题 *</label>
                <input
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">任务描述</label>
                <input
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                  value={form.what}
                  onChange={e => setForm(f => ({ ...f, what: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">负责人（唯一）*</label>
                  <input
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                    value={form.who}
                    onChange={e => setForm(f => ({ ...f, who: e.target.value }))}
                    required
                    placeholder="请填写唯一责任人"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">截止日期 *</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                    value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-600">完成标准 DoD * <span className="text-slate-400">（不少于10字，需明确可验证的交付物）</span></label>
                <textarea
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1 h-20 resize-none"
                  value={form.dod}
                  onChange={e => setForm(f => ({ ...f, dod: e.target.value }))}
                  required
                  placeholder="例：提供精度测试报告并归档，测试数据满足±0.01mm要求"
                />
                <div className="text-xs text-slate-400 text-right">{form.dod.length} / 最少10字</div>
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm border border-slate-300 rounded">取消</button>
                <button type="submit" className="px-3 py-1.5 text-sm bg-slate-800 text-white rounded">创建</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2 w-8"></th>
              <th className="text-left px-3 py-2">项目</th>
              <th className="text-left px-3 py-2">任务</th>
              <th className="text-left px-3 py-2">负责人</th>
              <th className="text-left px-3 py-2">完成标准 DoD</th>
              <th className="text-left px-3 py-2">截止日期</th>
              <th className="text-left px-3 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const overdue = isOverdue(item)
              const daysOver = getDaysOverdue(item)
              const isCritical = daysOver >= 3
              const isEditing = editingId === item.id
              
              return (
                <tr
                  key={item.id}
                  className={`border-t border-slate-100 ${
                    item.isCompleted ? 'opacity-50' :
                    isCritical ? 'bg-red-50' :
                    overdue ? 'bg-amber-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={e => handleComplete(item.id, e.target.checked)}
                      className="rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">{item.project?.name}</td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-sm"
                        value={editValues.title}
                        onChange={e => setEditValues(v => ({ ...v, title: e.target.value }))}
                      />
                    ) : (
                      <span className={item.isCompleted ? 'line-through text-slate-400' : 'font-medium'}>
                        {item.title}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        className="w-24 border border-slate-300 rounded px-1.5 py-0.5 text-sm"
                        value={editValues.who}
                        onChange={e => setEditValues(v => ({ ...v, who: e.target.value }))}
                      />
                    ) : (
                      <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{item.who}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600 max-w-xs truncate">
                    {isEditing ? (
                      <input
                        className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-sm"
                        value={editValues.dod}
                        onChange={e => setEditValues(v => ({ ...v, dod: e.target.value }))}
                      />
                    ) : (
                      item.dod
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        type="date"
                        className="border border-slate-300 rounded px-1.5 py-0.5 text-sm"
                        value={editValues.dueDate as string}
                        onChange={e => setEditValues(v => ({ ...v, dueDate: e.target.value }))}
                      />
                    ) : (
                      <span className={`text-xs ${overdue && !item.isCompleted ? 'text-red-600 font-bold' : ''}`}>
                        {new Date(item.dueDate).toLocaleDateString('zh-CN')}
                        {isCritical && !item.isCompleted && <span className="ml-1">🔴 逾期{daysOver}天</span>}
                        {overdue && !isCritical && !item.isCompleted && <span className="ml-1">🟡 逾期</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(item.id)} className="text-xs text-emerald-600 hover:text-emerald-800">保存</button>
                          <button onClick={() => setEditingId(null)} className="text-xs text-slate-500">取消</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(item)} className="text-xs text-slate-500 hover:text-slate-800">编辑</button>
                          <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700">删除</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">暂无待处理任务</div>
        )}
      </div>
    </div>
  )
}

export default function ActionsPage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-slate-500">加载中...</div>}>
      <ActionItemsContent />
    </Suspense>
  )
}
