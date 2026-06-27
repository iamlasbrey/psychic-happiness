// src/hooks/useBusinessProfile.ts
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Import this from your types file if you moved it
export interface BusinessProfile {
  status: string;
  message: string;
  data: {
    user: {
      id: string;
      phoneNumber: string;
      businessName: string;
    };
  };
}

export function useBusinessProfile() {
  const { data: session, status } = useSession();

  // Use the specific interface instead of 'any'
  const [profile, setProfile] = useState<BusinessProfile | null>(null);

  const isLoading = status === 'loading';
  const hasSession = !!session?.accessToken;

  useEffect(() => {
    if (!hasSession) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/profile/me`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.ok) {
          const data: BusinessProfile = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch fresh profile:', error);
      }
    };

    fetchProfile();
  }, [hasSession, session?.accessToken]);

  return { profile, loading: isLoading };
}
