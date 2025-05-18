import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Order } from '@prisma/client';
import { startOfDay, endOfDay, subDays } from 'date-fns';

const prisma = new PrismaClient();

type OrderWithRelations = Order & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orderItems: Array<any>;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const dateStr = url.searchParams.get('date');
  const prevOngoing = url.searchParams.get('prevOngoing') === 'true';

  let todayOrders: OrderWithRelations[] = [];
  let prevOngoingOrders: OrderWithRelations[] = [];

  if (dateStr) {
    // Get all orders for the given date
    const date = new Date(dateStr);
    todayOrders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
      include: {
        table: true,
        orderItems: { include: { menuItem: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (prevOngoing) {
    // Get ONGOING orders from previous day
    const prevDay = subDays(new Date(), 1);
    prevOngoingOrders = await prisma.order.findMany({
      where: {
        status: 'ONGOING',
        createdAt: {
          gte: startOfDay(prevDay),
          lte: endOfDay(prevDay),
        },
      },
      include: {
        table: true,
        orderItems: { include: { menuItem: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  return NextResponse.json({ todayOrders, prevOngoingOrders });
}
