'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import supabase from '@/libs/supabaseClient';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // If session exists and user is on login page, redirect to bookmarks
      if (session && (pathname === '/login' || pathname === '/')) {
        router.push('/bookmarks');
        return;
      }

      // If no session and not on login page, redirect to login
      if (!session && pathname !== '/login' && pathname !== '/auth/callback') {
        router.push('/login');
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && (pathname === '/login' || pathname === '/')) {
        router.push('/bookmarks');
      } else if (!session && pathname !== '/login' && pathname !== '/auth/callback') {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  return <>{children}</>;
}
