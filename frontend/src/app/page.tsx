'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import MainHeader from '@/components/MainHeader/MainHeader';
import MainBackground from '@/components/MainBackground/MainBackground';
import PageCards from '@/components/PageCards/PageCards';
import EmptyChart from '@/components/EmptyChart/EmptyChart';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (!authenticated) {
      router.push('/login');
    }
  }, [router]);

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.container}>
      <MainBackground />
      <MainHeader />
      <div className={styles.content}>
        <EmptyChart />
        <PageCards />
      </div>
    </div>
  );
}
