import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  
  try {
    const where = projectId ? { projectId } : {}
    const materials = await prisma.material.findMany({
      where,
      include: { project: { select: { name: true } } },
      orderBy: { orderDeadline: 'asc' },
    })
    return NextResponse.json(materials)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const requiredDate = new Date(body.requiredDate)
    const leadTimeWeeks = parseInt(body.leadTimeWeeks)
    const orderDeadline = new Date(requiredDate)
    orderDeadline.setDate(orderDeadline.getDate() - leadTimeWeeks * 7)
    
    const material = await prisma.material.create({
      data: {
        projectId: body.projectId,
        name: body.name,
        category: body.category,
        supplier: body.supplier || '',
        leadTimeWeeks,
        requiredDate,
        orderDeadline,
        status: body.status || '待下单',
      }
    })
    return NextResponse.json(material, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create material' }, { status: 500 })
  }
}
