import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      phoneNumber: string;
      businessName: string;
    };
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    phoneNumber: string;
    businessName: string;
    accessToken: string;
    refreshToken: string;
  }
}
