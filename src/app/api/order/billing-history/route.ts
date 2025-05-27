import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Order } from '@prisma/client';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { localDateFunc } from '@/lib/localDateFunc';

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
    // Get all orders for the given date in Bangladesh time
    const date = new Date(dateStr);

    // Convert to Bangladesh time zone
    const localDate = localDateFunc(date);
    const localStartOfDay = startOfDay(localDate);
    const localEndOfDay = endOfDay(localDate);
    console.log(localStartOfDay, localEndOfDay);

    todayOrders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: localStartOfDay,
          lte: localEndOfDay,
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
    // Get ONGOING orders from previous day in Bangladesh time
    const yesterday = subDays(new Date(), 1);
    const localYesterday = localDateFunc(yesterday);
    const localStartOfDay = startOfDay(localYesterday);
    const localEndOfDay = endOfDay(localYesterday);

    prevOngoingOrders = await prisma.order.findMany({
      where: {
        status: 'ONGOING',
        createdAt: {
          gte: localStartOfDay,
          lte: localEndOfDay,
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
