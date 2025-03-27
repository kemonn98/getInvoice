import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import prisma from '@/lib/prisma' // Adjust this import based on your setup

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sourceSlips, targetMonth, targetYear } = await request.json()

    // Get the current user's ID from the session
    const user = await prisma.user.findUnique({
      where: {
        email: session.user?.email as string,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create new salary slips based on the source data
    const newSlips = await Promise.all(
      sourceSlips.map(async (slip: any) => {
        return await prisma.salarySlip.create({
          data: {
            month: targetMonth,
            year: targetYear,
            basicSalary: slip.basicSalary,
            positionAllowance: slip.positionAllowance,
            familyAllowance: slip.familyAllowance,
            childAllowance: slip.childAllowance,
            foodAllowance: slip.foodAllowance,
            bonus: slip.bonus,
            thr: slip.thr,
            others: slip.others,
            totalSalary: slip.totalSalary,
            companyName: slip.companyName,
            companyAddress: slip.companyAddress,
            approvedBy: slip.approvedBy,
            approvedPosition: slip.approvedPosition,
            // Connect to both user and employee
            
            user: {
              connect: {
                id: user.id
              }
            },
            employee: {
              connect: {
                id: slip.employee.id // Connect to the existing employee
              }
            }
          },
        })
      })
    )

    return NextResponse.json(newSlips)
  } catch (error) {
    console.error('Error in bulk create:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(
      { error: 'Failed to create salary slips' },
      { status: 500 }
    )
  }
} 