'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type Material = {
  id: string
  name: string
  category: string
  supplier: string
  leadTimeWeeks: number
  requiredDate: string
  orderDeadline: string
  status: string
  projectId: string
  project: { name: string }
}

type Project = {
  id: string
  name: string
}

function isWarning(mat: Material) {
  if (mat.status !== '待下单') return false
  const days = (new Date(mat.orderDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return days <= 7
}

function MaterialsContent() {
  const searchParams = useSearchParams()
  const projectIdFilter = searchParams.get('projectId')

  const [materials, setMaterials] = useState<Material[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    projectId: projectIdFilter || '',
    name: '',
    category: '机械',
    supplier: '',
    leadTimeWeeks: 8,
    requiredDate: '',
    status: '待下单',
  })

  const load = () => {
    const url = projectIdFilter ? `/api/materials?projectId=${projectIdFilter}` : '/api/materials'
    fetch(url).then(r => r.json()).then(data => { setMaterials(data); setLoading(false) })
    fetch('/api/projects').then(r => r.json()).then(setProjects)
  }

  useEffect(load, [projectIdFilter])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { load(); setShowForm(false) }
  }

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...materials.find(m => m.id === id), status }),
    })
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除?')) return
    await fetch(`/api/materials/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) return <div className="text-center p-8 text-slate-500">加载中...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">📦 长周期物料追踪</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-slate-800 text-white px-3 py-1.5 text-sm rounded hover:bg-slate-700"
        >
          + 添加物料
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[480px] shadow-xl">
            <h2 className="font-bold mb-4">添加物料</h2>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">物料名称 *</label>
                  <input
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">类别 *</label>
                  <select
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option>机械</option>
                    <option>电气</option>
                    <option>视觉</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-600">供应商</label>
                <input
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                  value={form.supplier}
                  onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">交期（周）*</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                    value={form.leadTimeWeeks}
                    onChange={e => setForm(f => ({ ...f, leadTimeWeeks: parseInt(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">需求到货日 *</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                    value={form.requiredDate}
                    onChange={e => setForm(f => ({ ...f, requiredDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm border border-slate-300 rounded">取消</button>
                <button type="submit" className="px-3 py-1.5 text-sm bg-slate-800 text-white rounded">添加</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2">项目</th>
              <th className="text-left px-3 py-2">物料名称</th>
              <th className="text-left px-3 py-2">类别</th>
              <th className="text-left px-3 py-2">供应商</th>
              <th className="text-left px-3 py-2">交期(周)</th>
              <th className="text-left px-3 py-2">需求到货日</th>
              <th className="text-left px-3 py-2">最晚下单日</th>
              <th className="text-left px-3 py-2">状态</th>
              <th className="text-left px-3 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(mat => {
              const warning = isWarning(mat)
              const rowClass = warning ? 'bg-red-50 text-red-700' : 'hover:bg-slate-50'
              return (
                <tr key={mat.id} className={`border-t border-slate-100 ${rowClass}`}>
                  <td className="px-3 py-2 text-xs">{mat.project?.name}</td>
                  <td className="px-3 py-2 font-medium">{mat.name}</td>
                  <td className="px-3 py-2">
                    <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{mat.category}</span>
                  </td>
                  <td className="px-3 py-2 text-xs">{mat.supplier}</td>
                  <td className="px-3 py-2 text-center">{mat.leadTimeWeeks}</td>
                  <td className="px-3 py-2 text-xs">{new Date(mat.requiredDate).toLocaleDateString('zh-CN')}</td>
                  <td className={`px-3 py-2 text-xs font-medium ${warning ? 'text-red-700 font-bold' : ''}`}>
                    {new Date(mat.orderDeadline).toLocaleDateString('zh-CN')}
                    {warning && <span className="ml-1">⚠️</span>}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={mat.status}
                      onChange={e => handleStatusChange(mat.id, e.target.value)}
                      className={`text-xs px-1.5 py-0.5 rounded border-0 outline-none cursor-pointer ${
                        mat.status === '待下单' ? 'bg-amber-100 text-amber-700' :
                        mat.status === '已下单' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      <option value="待下单">待下单</option>
                      <option value="已下单">已下单</option>
                      <option value="已到货">已到货</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleDelete(mat.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >删除</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {materials.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">暂无物料记录</div>
        )}
      </div>
    </div>
  )
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-slate-500">加载中...</div>}>
      <MaterialsContent />
    </Suspense>
  )
}
