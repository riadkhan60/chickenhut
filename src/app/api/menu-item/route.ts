import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const items = await prisma.menuItem.findMany();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const item = await prisma.menuItem.create({ data });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error : 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const item = await prisma.menuItem.update({
    where: { id: data.id },
    data,
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  await prisma.menuItem.delete({ where: { id: data.id } });
  return NextResponse.json({ success: true });
}
