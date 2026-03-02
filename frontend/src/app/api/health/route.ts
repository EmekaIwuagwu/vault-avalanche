import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'operational',
        service: 'Vault Frontend',
        timestamp: new Date().toISOString()
    }, { status: 200 });
}
