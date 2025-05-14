import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const items = await prisma.orderItem.findMany();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const item = await prisma.orderItem.create({ data });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const item = await prisma.orderItem.update({
    where: { id: data.id },
    data,
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  await prisma.orderItem.delete({ where: { id: data.id } });
  return NextResponse.json({ success: true });
}
