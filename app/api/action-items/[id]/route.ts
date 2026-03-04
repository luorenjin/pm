import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    
    if (body.dod !== undefined && body.dod.length < 10) {
      return NextResponse.json(
        { error: 'DoD (Definition of Done) 不少于10个字' },
        { status: 400 }
      )
    }
    
    const updateData: Record<string, unknown> = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.what !== undefined) updateData.what = body.what
    if (body.who !== undefined) updateData.who = body.who
    if (body.dod !== undefined) updateData.dod = body.dod
    if (body.dueDate !== undefined) updateData.dueDate = new Date(body.dueDate)
    if (body.isCompleted !== undefined) {
      updateData.isCompleted = body.isCompleted
      updateData.completedAt = body.isCompleted ? new Date() : null
    }
    
    const item = await prisma.actionItem.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(item)
  } catch {
    return NextResponse.json({ error: 'Failed to update action item' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.actionItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete action item' }, { status: 500 })
  }
}
