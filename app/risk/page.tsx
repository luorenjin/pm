'use client'
import { useEffect, useState } from 'react'

export default function RiskPage() {
  const [report, setReport] = useState('')
  const [reportDate, setReportDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cached, setCached] = useState(false)

  const [emailTo, setEmailTo] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailResult, setEmailResult] = useState('')

  const loadReport = async (forceNew = false) => {
    setLoading(true)
    setError('')
    try {
      const url = forceNew ? '/api/ai/risk-report?forceNew=true' : '/api/ai/risk-report'
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '获取风险报告失败')
      } else {
        setReport(data.report)
        setReportDate(new Date(data.createdAt).toLocaleString('zh-CN'))
        setCached(data.cached)
      }
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [])

  const handleSendEmail = async () => {
    if (!emailTo.trim()) {
      setEmailResult('请填写收件人邮箱')
      return
    }
    setSendingEmail(true)
    setEmailResult('')
    try {
      const res = await fetch('/api/risk/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailTo, reportContent: report, reportDate }),
      })
      const data = await res.json()
      if (!res.ok) {
        setEmailResult(`发送失败：${data.error}`)
      } else {
        setEmailResult('✅ 邮件已发送成功')
      }
    } catch {
      setEmailResult('发送失败，网络错误')
    } finally {
      setSendingEmail(false)
    }
  }

  const renderReport = (text: string) => {
    return text.split('\n').map((line, i) => {
      const heading = line.match(/^【(.+)】/)
      if (heading) {
        return (
          <h3 key={i} className="font-bold text-slate-800 mt-4 mb-1 text-base">
            【{heading[1]}】
          </h3>
        )
      }
      if (line.startsWith('- ') || line.match(/^\d+\./)) {
        return (
          <div key={i} className="pl-3 text-slate-700 text-sm leading-relaxed">
            {line}
          </div>
        )
      }
      if (line.trim() === '') return <div key={i} className="h-1" />
      return (
        <p key={i} className="text-slate-700 text-sm leading-relaxed">
          {line}
        </p>
      )
    })
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">⚠️ 风险管理</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI 每日自动分析项目风险，支持邮件提醒</p>
        </div>
        <button
          onClick={() => loadReport(true)}
          disabled={loading}
          className="bg-slate-800 text-white px-3 py-1.5 text-sm rounded hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? '生成中...' : '🔄 重新生成'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Report Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-700 text-sm">📋 今日风险报告</h2>
            {reportDate && (
              <span className="text-xs text-slate-400">
                {cached ? '今日已缓存 · ' : ''}生成于 {reportDate}
              </span>
            )}
          </div>

          {loading && (
            <div className="flex items-center gap-2 py-12 justify-center text-slate-500 text-sm">
              <span className="animate-spin">⏳</span> AI 正在分析项目风险...
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              <p className="font-medium">⚠️ 获取失败</p>
              <p className="mt-1">{error}</p>
              {error.includes('OPENAI_API_KEY') && (
                <p className="mt-2 text-xs text-red-500">
                  请在 .env.local 中配置：OPENAI_API_KEY=your_key（可选：OPENAI_API_BASE、OPENAI_MODEL）
                </p>
              )}
            </div>
          )}

          {report && !loading && (
            <div className="prose prose-sm max-w-none">{renderReport(report)}</div>
          )}

          {!report && !loading && !error && (
            <div className="text-center py-12 text-slate-400 text-sm">暂无报告，请点击"重新生成"</div>
          )}
        </div>

        {/* Email Panel */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-semibold text-slate-700 text-sm mb-3">📧 邮件提醒</h2>
          <p className="text-xs text-slate-500 mb-4">
            将当日风险报告发送至指定邮箱。需在环境变量中配置 SMTP 信息。
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-600">收件人邮箱</label>
              <input
                type="email"
                className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mt-1"
                placeholder="example@company.com"
                value={emailTo}
                onChange={e => setEmailTo(e.target.value)}
              />
            </div>
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail || !report}
              className="w-full bg-slate-800 text-white px-3 py-1.5 text-sm rounded hover:bg-slate-700 disabled:opacity-50"
            >
              {sendingEmail ? '发送中...' : '📤 发送风险报告'}
            </button>
            {emailResult && (
              <p className={`text-xs mt-1 ${emailResult.startsWith('✅') ? 'text-emerald-600' : 'text-red-600'}`}>
                {emailResult}
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-600 mb-2">SMTP 配置说明</p>
            <div className="space-y-1 text-xs text-slate-400 font-mono">
              <p>SMTP_HOST=smtp.xxx.com</p>
              <p>SMTP_PORT=465</p>
              <p>SMTP_USER=your@email.com</p>
              <p>SMTP_PASS=your_password</p>
              <p>EMAIL_FROM=your@email.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
