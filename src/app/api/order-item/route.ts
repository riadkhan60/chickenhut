import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { localDateFunc } from '@/lib/localDateFunc';

const prisma = new PrismaClient();

export async function GET() {
  const items = await prisma.orderItem.findMany();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  // Get current Bangladesh time
  const now = localDateFunc(new Date());

  console.log(now);

  // Find the order to update its timestamps
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
  });

  if (order) {
    // Update the order's updatedAt timestamp
    await prisma.order.update({
      where: { id: data.orderId },
      data: { updatedAt: now },
    });
  }

  const item = await prisma.orderItem.create({ data });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();

  // Get current Bangladesh time
  const now = localDateFunc(new Date());

  // Update the parent order's updatedAt timestamp
  await prisma.order.update({
    where: { id: data.orderId },
    data: { updatedAt: now },
  });

  const item = await prisma.orderItem.update({
    where: { id: data.id },
    data,
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();

  // Get current Bangladesh time
  const now = localDateFunc(new Date());

  // Get the orderItem to find its orderId
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: data.id },
  });

  if (orderItem) {
    // Update the parent order's updatedAt timestamp
    await prisma.order.update({
      where: { id: orderItem.orderId },
      data: { updatedAt: now },
    });
  }

  await prisma.orderItem.delete({ where: { id: data.id } });
  return NextResponse.json({ success: true });
}
