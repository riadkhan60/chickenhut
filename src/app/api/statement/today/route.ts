import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';
import { localDateFunc } from '@/lib/localDateFunc';

const prisma = new PrismaClient();

export async function GET() {
  // Get today in Bangladesh time zone
  const today = new Date();
  const bangladeshToday = localDateFunc(today);
  const start = startOfDay(bangladeshToday);
  const end = endOfDay(bangladeshToday);

  console.log(start, end); // Log for debugging

  // Get all completed orders for today
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
      status: 'COMPLETED',
    },
    include: { table: true },
  });

  const totalSale = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;

  // Group sales by table
  const tableSalesMap: Record<string, number> = {};
  for (const order of orders) {
    const tableNumber = order.isParcel
      ? 'Parcel'
      : order.table?.number || 'Unknown';
    tableSalesMap[tableNumber] =
      (tableSalesMap[tableNumber] || 0) + order.total;
  }
  const tableSales = Object.entries(tableSalesMap).map(
    ([tableNumber, total]) => ({ tableNumber, total }),
  );

  return NextResponse.json({
    totalSale,
    totalOrders,
    tableSales,
    // Add formatted date in Bangladesh time for display
    date: new Date(bangladeshToday).toLocaleDateString(),
  });
}
