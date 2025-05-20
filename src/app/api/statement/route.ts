import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const statements = await prisma.menuItem.findMany();
  return NextResponse.json(statements);
}
