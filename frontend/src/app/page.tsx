'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/profile');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null;
}
