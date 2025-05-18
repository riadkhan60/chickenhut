import { NextRequest, NextResponse } from 'next/server';

const FLASK_PRINT_URL = 'http://localhost:5000/print';
const API_KEY = 'your-secret-api-key';

export async function POST(req: NextRequest) {
  try {
    const { statement } = await req.json();
    if (!statement) {
      return NextResponse.json(
        { error: 'No statement data provided' },
        { status: 400 },
      );
    }
    // Build kitchen-style content for statement
    const content: Array<Record<string, unknown>> = [];
    content.push({ type: 'header', text: 'STATEMENT' });
    content.push({
      name: 'Date',
      quantity: ` ${statement.date || new Date().toISOString().slice(0, 10)}`,
    });
    content.push({ name: 'Total Sale', quantity: ` ${statement.totalSale} tk` });
    content.push({
      name: 'Total Orders',
      quantity: statement.totalOrders,
    });
   
    // Send to Flask print server
    const printRes = await fetch(FLASK_PRINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY,
      },
      body: JSON.stringify({
        content,
        print_type: 'kitchen',
      }),
    });
    const printData = await printRes.json();
    if (!printRes.ok) {
      return NextResponse.json(
        { error: printData.error || 'Print failed' },
        { status: 500 },
      );
    }
    return NextResponse.json({
      success: true,
      message: printData.message || 'Statement printed successfully',
    });
  } catch  {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
