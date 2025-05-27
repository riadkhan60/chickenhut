import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  let record = await prisma.reportSendingTime.findFirst();
  if (!record) {
    // Create default if not exists
    record = await prisma.reportSendingTime.create({ data: { time: '20:00' } });
  }
  return NextResponse.json({ time: record.time });
}

export async function POST(req: NextRequest) {
  const { time } = await req.json();
  if (!time || typeof time !== 'string') {
    return NextResponse.json({ error: 'Invalid time' }, { status: 400 });
  }
  let record = await prisma.reportSendingTime.findFirst();
  if (!record) {
    record = await prisma.reportSendingTime.create({ data: { time } });
  } else {
    record = await prisma.reportSendingTime.update({
      where: { id: record.id },
      data: { time },
    });
  }
  return NextResponse.json({ time: record.time });
}
