import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, reportContent, reportDate } = body

    if (!to || !reportContent) {
      return NextResponse.json({ error: '缺少收件人或报告内容' }, { status: 400 })
    }

    const smtpHost = process.env.SMTP_HOST
    const smtpPort = Number(process.env.SMTP_PORT) || 465
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const emailFrom = process.env.EMAIL_FROM || smtpUser

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: '邮件服务未配置，请在环境变量中设置 SMTP_HOST / SMTP_USER / SMTP_PASS' },
        { status: 500 }
      )
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })

    const htmlContent = reportContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '<br/>')
      .replace(/【([^】]+)】/g, '<strong>【$1】</strong>')

    await transporter.sendMail({
      from: emailFrom,
      to,
      subject: `📊 PM-Pilot 风险日报 - ${reportDate || new Date().toLocaleDateString('zh-CN')}`,
      text: reportContent,
      html: `<div style="font-family:sans-serif;max-width:700px;margin:0 auto;padding:20px">
        <h2 style="color:#1e293b">📊 PM-Pilot 每日风险报告</h2>
        <p style="color:#64748b;font-size:13px">生成日期：${reportDate || new Date().toLocaleDateString('zh-CN')}</p>
        <hr style="border-color:#e2e8f0"/>
        <div style="line-height:1.8;color:#334155">${htmlContent}</div>
        <hr style="border-color:#e2e8f0"/>
        <p style="color:#94a3b8;font-size:12px">此邮件由 PM-Pilot 自动发送</p>
      </div>`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : '发送失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
