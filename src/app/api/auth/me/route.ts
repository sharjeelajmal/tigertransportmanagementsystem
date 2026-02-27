import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const cookie = request.cookies.get('auth_token');
        if (!cookie) {
            return NextResponse.json({ role: null }, { status: 401 });
        }

        const session = await decrypt(cookie.value);
        if (!session) {
            return NextResponse.json({ role: null }, { status: 401 });
        }

        return NextResponse.json({
            role: session.role || 'admin',
            username: session.username,
        });
    } catch {
        return NextResponse.json({ role: null }, { status: 500 });
    }
}
