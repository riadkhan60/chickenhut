import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const tables = await prisma.table.findMany();
  return NextResponse.json(tables);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const table = await prisma.table.create({ data });
  return NextResponse.json(table);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const table = await prisma.table.update({
    where: { id: data.id },
    data,
  });
  return NextResponse.json(table);
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  await prisma.table.delete({ where: { id: data.id } });
  return NextResponse.json({ success: true });
}
