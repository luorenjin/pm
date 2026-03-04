import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const requiredDate = new Date(body.requiredDate)
    const leadTimeWeeks = parseInt(body.leadTimeWeeks)
    const orderDeadline = new Date(requiredDate)
    orderDeadline.setDate(orderDeadline.getDate() - leadTimeWeeks * 7)
    
    const material = await prisma.material.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        supplier: body.supplier || '',
        leadTimeWeeks,
        requiredDate,
        orderDeadline,
        status: body.status,
      }
    })
    return NextResponse.json(material)
  } catch {
    return NextResponse.json({ error: 'Failed to update material' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.material.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 })
  }
}
