import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'API funciona correctamente' });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'POST API funciona correctamente' });
}
