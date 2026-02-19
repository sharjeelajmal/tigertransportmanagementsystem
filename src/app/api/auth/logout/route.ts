import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ message: 'Logged out successfully' });

    response.cookies.set('auth_token', '', {
        expires: new Date(0),
        path: '/',
    });

    return response;
}
