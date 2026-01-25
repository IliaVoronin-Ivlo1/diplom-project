'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { HiLightBulb, HiOutlineLightBulb } from 'react-icons/hi';
import styles from './MainHeader.module.css';

export default function MainHeader() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

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
      
      <div className={styles.actions}>
        <button className={styles.themeButton} onClick={toggleTheme} title={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}>
          {theme === 'dark' ? <HiOutlineLightBulb /> : <HiLightBulb />}
        </button>
        
        <button className={styles.profileButton} onClick={handleProfileClick} title="Профиль">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

