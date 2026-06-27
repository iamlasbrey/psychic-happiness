'use client';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';

export default function Dashboard() {
    const { profile, loading } = useBusinessProfile();
    console.log('Profile data:', profile);
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1 className="text-4xl font-bold">Welcome to the Dashboard</h1>
            <p className="mt-4 text-lg">This is a protected route. You are logged in!</p>
            {profile?.data?.user?.businessName && (
                <h1>Welcome back, {profile.data.user.businessName}</h1>
            )}
        </div>
    );
}

    