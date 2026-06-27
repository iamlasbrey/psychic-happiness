import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { normalizePhoneNumber } from '@/utils/phone';

interface CustomUser {
  id: string;
  phoneNumber: string;
  businessName: string;
  accessToken: string;
  refreshToken: string;
}

interface LoginResponse {
  data: CustomUser;
  message?: string;
}

type CustomJWT = Omit<JWT, 'accessToken'> & {
  accessToken?: string;
  refreshToken?: string;
  id: string;
  phoneNumber: string;
  businessName: string;
  accessTokenExpires?: number;
};

type CustomSession = Omit<Session, 'accessToken' | 'refreshToken'> & {
  user: Session['user'] & {
    id: string;
    phoneNumber: string;
    businessName: string;
  };
  accessToken?: string;
  refreshToken?: string;
};

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not configured');
}
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not configured');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phoneNumber: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const normalizedPhone = normalizePhoneNumber(credentials.phoneNumber);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                phoneNumber: normalizedPhone,
                password: credentials.password,
              }),
              signal: controller.signal,
            },
          );
          clearTimeout(timeoutId);

          const responseText = await response.text();
          let result: LoginResponse;
          try {
            result = JSON.parse(responseText) as LoginResponse;
          } catch {
            throw new Error(
              'Server returned an invalid response. Check your API URL.',
            );
          }

          if (!response.ok) {
            const errorMap: Record<number, string> = {
              400: 'Invalid request format',
              401: 'Phone number or password is incorrect',
              403: 'Account suspended. Contact support',
              429: 'Too many attempts. Please try again later',
              500: 'Server error. Please try again',
            };
            throw new Error(
              errorMap[response.status] ||
                result.message ||
                'Authentication failed',
            );
          }

          return {
            id: result.data.id,
            phoneNumber: result.data.phoneNumber,
            businessName: result.data.businessName,
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
          } as CustomUser;
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection.');
          }
          if (error instanceof Error) throw error;
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as CustomUser;
        (token as CustomJWT).id = u.id;
        (token as CustomJWT).phoneNumber = u.phoneNumber;
        (token as CustomJWT).businessName = u.businessName;
        (token as CustomJWT).accessToken = u.accessToken;
        (token as CustomJWT).refreshToken = u.refreshToken;
        (token as CustomJWT).accessTokenExpires =
          Date.now() + 24 * 60 * 60 * 1000;
      }

      const t = token as CustomJWT;
      const now = Date.now();
      const expires = t.accessTokenExpires ?? 0;

      if (now < expires - 60_000) return token;

      if (t.refreshToken) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: t.refreshToken }),
            },
          );
          if (res.ok) {
            const data = await res.json();
            t.accessToken = data.accessToken;
            t.refreshToken = data.refreshToken ?? t.refreshToken;
            t.accessTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
          }
        } catch {}
      }

      if (!t.accessToken) {
        t.accessToken = undefined;
        t.refreshToken = undefined;
      }

      return token;
    },
    async session({ session, token }) {
      const s = session as CustomSession;
      const t = token as CustomJWT;

      if (s.user) {
        s.user.id = t.id;
        s.user.phoneNumber = t.phoneNumber;
        s.user.businessName = t.businessName;
      }
      s.accessToken = t.accessToken;
      s.refreshToken = t.refreshToken;

      return s as Session;
    },
  },
};
