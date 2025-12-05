'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import MainHeader from '@/components/MainHeader/MainHeader';
import ClusteringChart from '@/components/ClusteringChart/ClusteringChart';
import ClusteringBackground from '@/components/ClusteringBackground/ClusteringBackground';
import styles from './clustering.module.css';

export default function ClusteringPage() {
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
      <ClusteringBackground />
      <MainHeader />
      <div className={styles.content}>
        <div className={styles.chartSection}>
          <ClusteringChart />
        </div>
      </div>
    </div>
  );
}

