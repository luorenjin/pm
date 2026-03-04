'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Project = {
  id: string
  name: string
  phase: string
  owner: string
  description: string
  status: 'red' | 'yellow' | 'green'
  materials: unknown[]
  actionItems: unknown[]
}

const statusConfig = {
  red: { label: '🔴 危险', bgClass: 'bg-red-50 border-red-300', textClass: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  yellow: { label: '🟡 警告', bgClass: 'bg-amber-50 border-amber-300', textClass: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  green: { label: '🟢 正常', bgClass: 'bg-white border-slate-200 opacity-70', textClass: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [form, setForm] = useState({ name: '', phase: 'EVT', owner: '', description: '' })

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => { setProjects(data); setLoading(false) })
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const newProject = await res.json()
      setProjects(prev => [...prev, { ...newProject, status: 'green', materials: [], actionItems: [] }])
      setShowNewProject(false)
      setForm({ name: '', phase: 'EVT', owner: '', description: '' })
    }
  }

  if (loading) return <div className="text-center p-8 text-slate-500">加载中...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">🎛️ 项目状态大盘</h1>
        <button
          onClick={() => setShowNewProject(true)}
          className="bg-slate-800 text-white px-3 py-1.5 text-sm rounded hover:bg-slate-700"
        >
          + 新建项目
        </button>
      </div>

      {showNewProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h2 className="font-bold mb-4">新建项目</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">项目名称 *</label>
                <input
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">当前阶段 *</label>
                <select
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                  value={form.phase}
                  onChange={e => setForm(f => ({ ...f, phase: e.target.value }))}
                >
                  <option value="EVT">EVT</option>
                  <option value="DVT">DVT</option>
                  <option value="MP">MP</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">负责人 *</label>
                <input
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                  value={form.owner}
                  onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">描述</label>
                <input
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowNewProject(false)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded"
                >取消</button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-slate-800 text-white rounded"
                >创建</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => {
          const cfg = statusConfig[project.status]
          return (
            <div
              key={project.id}
              className={`border rounded-lg p-4 ${cfg.bgClass}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-800">{project.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{project.description}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-3">
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">{project.phase}</span>
                <span>👤 {project.owner}</span>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                <Link
                  href={`/materials?projectId=${project.id}`}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  📦 物料 ({project.materials.length})
                </Link>
                <Link
                  href={`/actions?projectId=${project.id}`}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  ✅ 任务 ({(project.actionItems as {isCompleted: boolean}[]).filter(i => !i.isCompleted).length})
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
