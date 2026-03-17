import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Simular datos en tiempo real (en producción vendrían de WebSocket o sistema de monitoreo)
    const mockStats = {
      activeVisitors: Math.floor(Math.random() * 100) + 50,
      activePortals: Math.floor(Math.random() * 10) + 5,
      todaySessions: Math.floor(Math.random() * 500) + 200,
    };

    // En un escenario real, haríamos consultas a la base de datos:
    // const activeVisitors = await prisma.visitor.count({
    //   where: {
    //     createdAt: {
    //       gte: new Date(Date.now() - 30 * 60 * 1000) // Últimos 30 minutos
    //     }
    //   }
    // });

    // const activePortals = await prisma.portal.count({
    //   where: { status: 'active' }
    // });

    // const todaySessions = await prisma.session.count({
    //   where: {
    //     createdAt: {
    //       gte: new Date(new Date().setHours(0, 0, 0, 0)) // Hoy
    //     }
    //   }
    // });

    return NextResponse.json(mockStats);
  } catch (error) {
    console.error('Error fetching realtime stats:', error);
    return NextResponse.json(
      { error: 'Error fetching stats' },
      { status: 500 }
    );
  }
}
