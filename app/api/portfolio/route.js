import { NextResponse } from 'next/server';

export async function GET() {
  const portfolios = [
    { title: 'BIBIGO', imageUrl: '' },
    { title: 'JzCommunications Project', imageUrl: '' }
  ];
  
  return NextResponse.json(portfolios, { headers: { 'Access-Control-Allow-Origin': '*' } });
}
