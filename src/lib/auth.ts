import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d') // Session expires in 1 day
        .sign(key);
}

/** Session of the logged-in user from the auth cookie, or null. Use in API routes (middleware does not cover /api). */
export async function getRequestSession(req: { cookies: { get(name: string): { value: string } | undefined } }) {
    const token = req.cookies.get('auth_token')?.value;
    return token ? decrypt(token) : null;
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}
