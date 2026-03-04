'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type Spec = {
  id: string
  projectId: string
  tab: string
  paramName: string
  setValue: string
  verifyMethod: string
}

type Project = {
  id: string
  name: string
}

const TABS = ['业务与KPI', '机械与运动约束', '视觉与算法', '现场与环境约束']

function SpecsContent() {
  const searchParams = useSearchParams()
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('projectId') || '')
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [specs, setSpecs] = useState<Spec[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Spec>>({})
  const [form, setForm] = useState({ paramName: '', setValue: '', verifyMethod: '' })
  const [cloneProjectId, setCloneProjectId] = useState('')
  const [showClone, setShowClone] = useState(false)

  const load = () => {
    if (!selectedProjectId) { setLoading(false); return }
    fetch(`/api/specs?projectId=${selectedProjectId}`)
      .then(r => r.json())
      .then(data => { setSpecs(data); setLoading(false) })
  }

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(data => {
      setProjects(data)
      if (!selectedProjectId && data.length > 0) setSelectedProjectId(data[0].id)
    })
  }, [])

  useEffect(load, [selectedProjectId])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/specs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, projectId: selectedProjectId, tab: activeTab }),
    })
    if (res.ok) { load(); setShowForm(false); setForm({ paramName: '', setValue: '', verifyMethod: '' }) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除?')) return
    await fetch(`/api/specs/${id}`, { method: 'DELETE' })
    load()
  }

  const saveEdit = async (id: string) => {
    await fetch(`/api/specs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editValues),
    })
    setEditingId(null)
    load()
  }

  const handleClone = async () => {
    if (!cloneProjectId) return
    const sourceSpecs = await fetch(`/api/specs?projectId=${cloneProjectId}`).then(r => r.json())
    for (const spec of sourceSpecs) {
      await fetch('/api/specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          tab: spec.tab,
          paramName: spec.paramName,
          setValue: spec.setValue,
          verifyMethod: spec.verifyMethod,
        }),
      })
    }
    setShowClone(false)
    load()
  }

  const filteredSpecs = specs.filter(s => s.tab === activeTab)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">📋 装备规格书构建器</h1>
        <div className="flex items-center gap-2">
          <select
            className="border border-slate-300 rounded px-2 py-1.5 text-sm"
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button
            onClick={() => setShowClone(true)}
            className="border border-slate-300 text-slate-600 px-3 py-1.5 text-sm rounded hover:bg-slate-100"
          >
            📥 克隆规格
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-slate-800 text-white px-3 py-1.5 text-sm rounded hover:bg-slate-700"
          >
            + 添加参数
          </button>
        </div>
      </div>

      {showClone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h2 className="font-bold mb-4">克隆历史项目规格</h2>
            <p className="text-sm text-slate-500 mb-3">选择源项目，将全量复制其规格数据至当前项目。</p>
            <select
              className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mb-4"
              value={cloneProjectId}
              onChange={e => setCloneProjectId(e.target.value)}
            >
              <option value="">请选择源项目</option>
              {projects.filter(p => p.id !== selectedProjectId).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowClone(false)} className="px-3 py-1.5 text-sm border border-slate-300 rounded">取消</button>
              <button onClick={handleClone} className="px-3 py-1.5 text-sm bg-slate-800 text-white rounded">开始克隆</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[480px] shadow-xl">
            <h2 className="font-bold mb-4">添加规格参数 - {activeTab}</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">参数名 *</label>
                <input
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                  value={form.paramName}
                  onChange={e => setForm(f => ({ ...f, paramName: e.target.value }))}
                  placeholder="如：Z轴下压力范围"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">设定值 *</label>
                <input
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                  value={form.setValue}
                  onChange={e => setForm(f => ({ ...f, setValue: e.target.value }))}
                  placeholder="如：0.5N - 50N"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">验证方式 *</label>
                <input
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                  value={form.verifyMethod}
                  onChange={e => setForm(f => ({ ...f, verifyMethod: e.target.value }))}
                  placeholder="如：高精度测力计校验"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm border border-slate-300 rounded">取消</button>
                <button type="submit" className="px-3 py-1.5 text-sm bg-slate-800 text-white rounded">添加</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-0 mb-0 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-slate-800 text-slate-800 font-medium'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-b-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2">参数名</th>
              <th className="text-left px-3 py-2">设定值</th>
              <th className="text-left px-3 py-2">验证方式</th>
              <th className="text-left px-3 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredSpecs.map(spec => {
              const isEditing = editingId === spec.id
              return (
                <tr key={spec.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium">
                    {isEditing ? (
                      <input
                        className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-sm"
                        value={editValues.paramName}
                        onChange={e => setEditValues(v => ({ ...v, paramName: e.target.value }))}
                      />
                    ) : spec.paramName}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-sm"
                        value={editValues.setValue}
                        onChange={e => setEditValues(v => ({ ...v, setValue: e.target.value }))}
                      />
                    ) : <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">{spec.setValue}</code>}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {isEditing ? (
                      <input
                        className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-sm"
                        value={editValues.verifyMethod}
                        onChange={e => setEditValues(v => ({ ...v, verifyMethod: e.target.value }))}
                      />
                    ) : spec.verifyMethod}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(spec.id)} className="text-xs text-emerald-600 hover:text-emerald-800">保存</button>
                          <button onClick={() => setEditingId(null)} className="text-xs text-slate-500">取消</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingId(spec.id); setEditValues(spec) }}
                            className="text-xs text-slate-500 hover:text-slate-800"
                          >编辑</button>
                          <button onClick={() => handleDelete(spec.id)} className="text-xs text-red-500 hover:text-red-700">删除</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filteredSpecs.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">暂无规格参数</div>
        )}
      </div>
    </div>
  )
}

export default function SpecsPage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-slate-500">加载中...</div>}>
      <SpecsContent />
    </Suspense>
  )
}
