import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const managerUsername = process.env.MANAGER_USERNAME;
        const managerPassword = process.env.MANAGER_PASSWORD;

        // Determine role based on credentials
        let role: 'admin' | 'manager' | null = null;

        if (username === adminUsername && password === adminPassword) {
            role = 'admin';
        } else if (username === managerUsername && password === managerPassword) {
            role = 'manager';
        }

        if (!role) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Create session with role
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
        const session = await encrypt({ username, role, expires });

        // Set cookie
        const response = NextResponse.json(
            { message: 'Login successful', role },
            { status: 200 }
        );

        response.cookies.set('auth_token', session, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
