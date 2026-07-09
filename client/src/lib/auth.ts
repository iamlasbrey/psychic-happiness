import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { normalizePhoneNumber } from '@/utils/phone';

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

          if (!response.ok) {
            const errorMap: Record<number, string> = {
              400: 'Invalid request format',
              401: 'Phone number or password is incorrect',
              403: 'Account suspended. Contact support',
              429: 'Too many attempts. Please try again later',
              500: 'Server error. Please try again',
            };

            const result = await response.json().catch(() => ({}));
            throw new Error(
              errorMap[response.status] ||
                result.message ||
                'Authentication failed',
            );
          }

          const result = await response.json();

          return {
            id: result.data.id,
            phoneNumber: result.data.phoneNumber,
            businessName: result.data.businessName,
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
          };
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection.');
          }
          throw error;
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phoneNumber = user.phoneNumber;
        token.businessName = user.businessName;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      }

      // Skip refresh if token is still valid (5+ minutes remaining)
      const expires = token.accessTokenExpires ?? 0;
      if (Date.now() < expires - 5 * 60 * 1000) {
        return token;
      }

      // Attempt token refresh
      if (token.refreshToken) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: token.refreshToken }),
              signal: AbortSignal.timeout(5000),
            },
          );

          if (res.ok) {
            const data = await res.json();
            token.accessToken = data.accessToken;
            token.refreshToken = data.refreshToken ?? token.refreshToken;
            token.accessTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
          } else {
            // Refresh failed - clear tokens
            token.accessToken = undefined;
            token.refreshToken = undefined;
          }
        } catch (error) {
          console.warn('Token refresh failed:', error);
          token.accessToken = undefined;
          token.refreshToken = undefined;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;

      if (session.user) {
        session.user.id = token.id;
        session.user.phoneNumber = token.phoneNumber;
        session.user.businessName = token.businessName;
      }

      return session;
    },
  },
};
