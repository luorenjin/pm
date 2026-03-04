import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  
  try {
    const where = projectId ? { projectId } : {}
    const specs = await prisma.spec.findMany({
      where,
      orderBy: [{ tab: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json(specs)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch specs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const spec = await prisma.spec.create({
      data: {
        projectId: body.projectId,
        tab: body.tab,
        paramName: body.paramName,
        setValue: body.setValue,
        verifyMethod: body.verifyMethod,
      }
    })
    return NextResponse.json(spec, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create spec' }, { status: 500 })
  }
}
