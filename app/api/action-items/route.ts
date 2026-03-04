import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const showCompleted = searchParams.get('showCompleted') === 'true'
  
  try {
    const where: { projectId?: string; isCompleted?: boolean } = {}
    if (projectId) where.projectId = projectId
    if (!showCompleted) where.isCompleted = false
    
    const items = await prisma.actionItem.findMany({
      where,
      include: { project: { select: { name: true } } },
      orderBy: { dueDate: 'asc' },
    })
    return NextResponse.json(items)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch action items' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.dod || body.dod.length < 10) {
      return NextResponse.json(
        { error: 'DoD (Definition of Done) 必须填写且不少于10个字' },
        { status: 400 }
      )
    }
    
    const item = await prisma.actionItem.create({
      data: {
        projectId: body.projectId,
        title: body.title,
        what: body.what,
        who: body.who,
        dod: body.dod,
        dueDate: new Date(body.dueDate),
        isCompleted: false,
      }
    })
    return NextResponse.json(item, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create action item' }, { status: 500 })
  }
}
