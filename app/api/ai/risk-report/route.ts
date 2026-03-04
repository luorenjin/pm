import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function callAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  const apiBase = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1'
  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'

  if (!apiKey) {
    throw new Error('未配置 OPENAI_API_KEY，请在环境变量中设置')
  }

  const response = await fetch(`${apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            '你是一名资深硬件研发项目经理，擅长精密机械、电子硬件、工业自动化领域的风险管理。请以工程师视角分析项目风险，输出结构化的风险报告，使用中文，条目清晰。',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`AI 接口调用失败: ${response.status} ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? '未获取到风险报告'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const forceNew = searchParams.get('forceNew') === 'true'

  try {
    if (!forceNew) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const existing = await prisma.riskReport.findFirst({
        where: { createdAt: { gte: today } },
        orderBy: { createdAt: 'desc' },
      })
      if (existing) {
        return NextResponse.json({ report: existing.content, createdAt: existing.createdAt, cached: true })
      }
    }

    const projects = await prisma.project.findMany({
      include: { materials: true, actionItems: true },
    })

    const now = new Date()

    const projectSummaries = projects.map(p => {
      const overdueItems = p.actionItems.filter(i => {
        if (i.isCompleted) return false
        return new Date(i.dueDate) < now
      })
      const urgentMaterials = p.materials.filter(m => {
        if (m.status !== '待下单') return false
        const days = (new Date(m.orderDeadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        return days <= 7
      })
      return {
        name: p.name,
        phase: p.phase,
        owner: p.owner,
        overdueItems: overdueItems.map(i => ({
          title: i.title,
          who: i.who,
          daysOverdue: Math.floor((now.getTime() - new Date(i.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
        })),
        urgentMaterials: urgentMaterials.map(m => ({
          name: m.name,
          daysToDeadline: Math.floor((new Date(m.orderDeadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        })),
      }
    })

    const prompt = `请根据以下项目数据生成今日风险报告（${now.toLocaleDateString('zh-CN')}）：

${JSON.stringify(projectSummaries, null, 2)}

请输出包含以下章节的风险报告：
1. 【总体风险概览】当前最需关注的2-3个风险
2. 【逐项目风险分析】针对每个有风险的项目，分析其风险等级（高/中/低）和原因
3. 【今日重点关注事项】列出今天最需推进的关键任务（按优先级排序）
4. 【建议行动】给出今日的具体行动建议`

    const reportContent = await callAI(prompt)

    const saved = await prisma.riskReport.create({
      data: { content: reportContent },
    })

    return NextResponse.json({ report: saved.content, createdAt: saved.createdAt, cached: false })
  } catch (err) {
    const message = err instanceof Error ? err.message : '生成风险报告失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
