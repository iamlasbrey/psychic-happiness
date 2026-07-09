// src/types/next-auth.d.ts
import type { DefaultSession } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      phoneNumber: string;
      businessName: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    phoneNumber: string;
    businessName: string;
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    phoneNumber: string;
    businessName: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
}
