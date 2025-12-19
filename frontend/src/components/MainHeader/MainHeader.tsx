'use client';

import { useRouter } from 'next/navigation';
import styles from './MainHeader.module.css';

export default function MainHeader() {
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <div className={styles.header}>
      <div className={styles.logo} onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <div className={styles.logoIcon}></div>
        <div className={styles.logoText}>Corstat</div>
      </div>
      
      <button className={styles.profileButton} onClick={handleProfileClick} title="Профиль">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>
    </div>
  );
}

