import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const statements = await prisma.statement.findMany();
  return NextResponse.json(statements);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const statement = await prisma.statement.create({ data });
  return NextResponse.json(statement);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const statement = await prisma.statement.update({
    where: { id: data.id },
    data,
  });
  return NextResponse.json(statement);
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  await prisma.statement.delete({ where: { id: data.id } });
  return NextResponse.json({ success: true });
}
