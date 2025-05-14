import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const user = await prisma.user.create({ data });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const user = await prisma.user.update({
    where: { id: data.id },
    data,
  });
  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  await prisma.user.delete({ where: { id: data.id } });
  return NextResponse.json({ success: true });
}
