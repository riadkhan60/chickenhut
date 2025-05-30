import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { localDateFunc } from '@/lib/localDateFunc';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where = status ? { status: status as any } : undefined;

  const orders = await prisma.order.findMany({
    where,
    include: {
      table: true,
      orderItems: {
        include: {
          menuItem: true,
        },
      },
    },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { orderItems, ...orderData } = data;

  // Use Bangladesh time for createdAt and updatedAt
  const now = localDateFunc(new Date());

  const order = await prisma.order.create({
    data: {
      ...orderData,
      createdAt: now,
      updatedAt: now,
      orderItems: {
        create: orderItems,
      },
    },
  });
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { orderItems, ...orderData } = data;

  // Use Bangladesh time for updatedAt
  const now = localDateFunc(new Date());

  const order = await prisma.order.update({
    where: { id: orderData.id },
    data: {
      ...orderData,
      updatedAt: now,
      orderItems: {
        deleteMany: {},
        create: orderItems,
      },
    },
    include: {
      table: true,
      orderItems: {
        include: {
          menuItem: true,
        },
      },
    },
  });
  return NextResponse.json(order);
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  await prisma.order.delete({ where: { id: data.id } });
  return NextResponse.json({ success: true });
}
