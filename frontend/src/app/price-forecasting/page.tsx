'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import MainHeader from '@/components/MainHeader/MainHeader';
import MainBackground from '@/components/MainBackground/MainBackground';
import styles from './price-forecasting.module.css';

export default function PriceForecastingPage() {
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
        <div className={styles.placeholder}>
          <h1 className={styles.title}>Прогнозирование цен автозапчастей</h1>
          <p className={styles.subtitle}>Страница в разработке</p>
        </div>
      </div>
    </div>
  );
}

