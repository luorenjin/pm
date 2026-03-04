import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function computeProjectStatus(
  materials: { status: string; orderDeadline: Date }[],
  actionItems: { isCompleted: boolean; dueDate: Date }[]
) {
  const now = new Date()
  
  const hasCriticalOverdue = actionItems.some(item => {
    if (item.isCompleted) return false
    const overdueDays = (now.getTime() - item.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    return overdueDays >= 3
  })
  if (hasCriticalOverdue) return 'red'
  
  const hasWarningOverdue = actionItems.some(item => {
    if (item.isCompleted) return false
    const overdueDays = (now.getTime() - item.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    return overdueDays > 0 && overdueDays < 3
  })
  
  const hasUpcomingMaterial = materials.some(mat => {
    if (mat.status !== '待下单') return false
    const daysToDeadline = (mat.orderDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return daysToDeadline <= 7
  })
  
  if (hasWarningOverdue || hasUpcomingMaterial) return 'yellow'
  return 'green'
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        materials: true,
        actionItems: true,
      },
      orderBy: { createdAt: 'asc' },
    })
    
    const projectsWithStatus = projects.map(p => ({
      ...p,
      status: computeProjectStatus(p.materials, p.actionItems),
    }))
    
    projectsWithStatus.sort((a, b) => {
      const order = { red: 0, yellow: 1, green: 2 }
      return order[a.status as keyof typeof order] - order[b.status as keyof typeof order]
    })
    
    return NextResponse.json(projectsWithStatus)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const project = await prisma.project.create({
      data: {
        name: body.name,
        phase: body.phase,
        owner: body.owner,
        description: body.description,
      }
    })
    return NextResponse.json(project, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
