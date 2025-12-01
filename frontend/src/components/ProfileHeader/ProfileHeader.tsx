import styles from './ProfileHeader.module.css';

interface ProfileHeaderProps {
  onLogout: () => void;
}

export default function ProfileHeader({ onLogout }: ProfileHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}></div>
        <div className={styles.logoText}>Corstat</div>
      </div>
      
      <button className={styles.logoutButton} onClick={onLogout} title="Выход">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
}

