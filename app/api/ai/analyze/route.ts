import { NextResponse } from 'next/server'

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
            '你是一名资深硬件研发工程师，擅长精密机械、电子硬件、工业自动化领域。请以工程师视角分析项目事项，用专业语言解释术语，并给出可落地的应对建议。回复使用中文，结构清晰，条目分明。',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`AI 接口调用失败: ${response.status} ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? '未获取到分析结果'
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, what, who, dod, dueDate, projectName } = body

    const prompt = `请分析以下工程项目事项，包括：
1. 【术语解释】用工程师视角解释其中涉及的专业术语和技术概念
2. 【风险分析】识别该事项可能面临的技术或管理风险
3. 【应对建议】给出具体可操作的应对策略和注意事项（不要自动创建新的待办事项，仅提供建议）

事项信息：
- 所属项目：${projectName || '未知'}
- 任务标题：${title}
- 任务描述：${what || '无'}
- 负责人：${who}
- 完成标准（DoD）：${dod}
- 截止日期：${dueDate}`

    const analysis = await callAI(prompt)
    return NextResponse.json({ analysis })
  } catch (err) {
    const message = err instanceof Error ? err.message : '分析失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
