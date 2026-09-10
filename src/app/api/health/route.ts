import { NextResponse } from 'next/server';
import { PRODUCT_NAME } from '@/lib/brand';

export async function GET() {
  return NextResponse.json({
    status: 'operational',
    platform: PRODUCT_NAME,
    version: '1.0.0',
    uptime: process.uptime ? Math.round(process.uptime()) : 0,
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/flights',
      '/api/satellites',
      '/api/earthquakes',
      '/api/news',
      '/api/gdelt',
      '/api/markets',
      '/api/frontlines',
      '/api/region-dossier',
    ],
  });
}
