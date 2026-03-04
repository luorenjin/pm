import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const spec = await prisma.spec.update({
      where: { id },
      data: {
        tab: body.tab,
        paramName: body.paramName,
        setValue: body.setValue,
        verifyMethod: body.verifyMethod,
      }
    })
    return NextResponse.json(spec)
  } catch {
    return NextResponse.json({ error: 'Failed to update spec' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.spec.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete spec' }, { status: 500 })
  }
}
