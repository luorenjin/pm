import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const project1 = await prisma.project.create({
    data: {
      name: '高速贴片机 HM-2026',
      phase: 'DVT',
      owner: '张工',
      description: '新一代高速SMT贴片机研发项目',
    }
  })

  const project2 = await prisma.project.create({
    data: {
      name: '固晶机 DB-Pro X1',
      phase: 'EVT',
      owner: '李工',
      description: '精密固晶机研发项目',
    }
  })

  const project3 = await prisma.project.create({
    data: {
      name: '视觉检测系统 VIS-300',
      phase: 'MP',
      owner: '王工',
      description: '视觉检测系统量产阶段',
    }
  })

  const now = new Date()
  const addDays = (d: Date, days: number) => {
    const r = new Date(d)
    r.setDate(r.getDate() + days)
    return r
  }

  await prisma.material.createMany({
    data: [
      {
        projectId: project1.id,
        name: '直线电机模组',
        category: '机械',
        supplier: '哈默纳科',
        leadTimeWeeks: 12,
        requiredDate: addDays(now, 90),
        orderDeadline: addDays(now, 6),
        status: '待下单',
      },
      {
        projectId: project1.id,
        name: 'FPGA控制板',
        category: '电气',
        supplier: '研华科技',
        leadTimeWeeks: 8,
        requiredDate: addDays(now, 80),
        orderDeadline: addDays(now, 24),
        status: '已下单',
      },
      {
        projectId: project2.id,
        name: '高精度视觉相机',
        category: '视觉',
        supplier: 'Cognex',
        leadTimeWeeks: 16,
        requiredDate: addDays(now, 120),
        orderDeadline: addDays(now, 8),
        status: '待下单',
      },
      {
        projectId: project2.id,
        name: '精密Z轴模组',
        category: '机械',
        supplier: '日本THK',
        leadTimeWeeks: 10,
        requiredDate: addDays(now, 100),
        orderDeadline: addDays(now, 30),
        status: '待下单',
      },
    ]
  })

  const yesterday = addDays(now, -1)
  const threeDaysAgo = addDays(now, -3)
  const nextWeek = addDays(now, 7)
  const tomorrow = addDays(now, 1)

  await prisma.actionItem.createMany({
    data: [
      {
        projectId: project1.id,
        title: '完成Z轴精度测试',
        what: '对Z轴运动精度进行全范围测试验证',
        who: '张工',
        dod: '提供精度测试报告并归档至共享盘，测试数据满足±0.01mm精度要求',
        dueDate: threeDaysAgo,
        isCompleted: false,
      },
      {
        projectId: project1.id,
        title: '供应商评审会议纪要',
        what: '整理上周供应商评审会议纪要',
        who: '王助理',
        dod: '会议纪要完成并发送至所有与会人员邮件，并上传至项目文档库',
        dueDate: yesterday,
        isCompleted: false,
      },
      {
        projectId: project2.id,
        title: '视觉算法精度优化',
        what: '优化视觉识别算法以满足0.05mm精度要求',
        who: '陈工',
        dod: '完成算法优化，在标准测试样本上达到99.5%以上识别率，输出测试报告',
        dueDate: nextWeek,
        isCompleted: false,
      },
      {
        projectId: project3.id,
        title: '量产工艺文件审核',
        what: '审核量产工艺文件是否符合客户要求',
        who: '刘工',
        dod: '完成审核并签署确认，提交ECO变更申请',
        dueDate: tomorrow,
        isCompleted: true,
        completedAt: now,
      },
    ]
  })

  await prisma.spec.createMany({
    data: [
      {
        projectId: project1.id,
        tab: '业务与KPI',
        paramName: 'UPH目标值',
        setValue: '≥ 50,000 CPH',
        verifyMethod: '连续运行8小时统计平均UPH',
      },
      {
        projectId: project1.id,
        tab: '业务与KPI',
        paramName: '贴装精度',
        setValue: '±0.025mm (3σ)',
        verifyMethod: '使用AOI设备测量1000个贴装点',
      },
      {
        projectId: project1.id,
        tab: '机械与运动约束',
        paramName: 'Z轴下压力范围',
        setValue: '0.5N - 50N',
        verifyMethod: '高精度测力计校验',
      },
      {
        projectId: project1.id,
        tab: '视觉与算法',
        paramName: '识别率',
        setValue: '≥ 99.5%',
        verifyMethod: '标准测试样本库验证',
      },
    ]
  })

  console.log('Seed data created successfully')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
