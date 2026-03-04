import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'PM-Pilot | 精密装备研发管理系统',
  description: '高端精密装备研发项目管理驾驶舱',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans bg-slate-50 text-slate-800">
        <nav className="bg-slate-800 text-white px-6 py-3 flex items-center gap-6">
          <span className="font-bold text-lg">🚀 PM-Pilot</span>
          <Link href="/" className="text-slate-300 hover:text-white text-sm">大盘</Link>
          <Link href="/materials" className="text-slate-300 hover:text-white text-sm">物料追踪</Link>
          <Link href="/actions" className="text-slate-300 hover:text-white text-sm">任务池</Link>
          <Link href="/specs" className="text-slate-300 hover:text-white text-sm">规格书</Link>
          <Link href="/risk" className="text-slate-300 hover:text-white text-sm">风险管理</Link>
        </nav>
        <main className="p-4">{children}</main>
      </body>
    </html>
  )
}
