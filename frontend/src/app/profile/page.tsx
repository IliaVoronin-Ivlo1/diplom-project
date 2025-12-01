'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import authService from '@/services/auth.service';
import profileService from '@/services/profile.service';
import styles from './profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState('');
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const registered = searchParams.get('registered');

    if (token && registered === 'true') {
      authService.setToken(token);
      setRegistrationSuccess(true);
      window.history.replaceState({}, '', '/profile');
      
      setTimeout(() => {
        setRegistrationSuccess(false);
      }, 5000);
    }

    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadUserData();
  }, [router, searchParams]);

  const loadUserData = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response);
      const userName = response.name || '';
      setName(userName);
      setOriginalName(userName);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      authService.removeToken();
      router.push('/login');
    } catch (error) {
      authService.removeToken();
      router.push('/login');
    }
  };

  const handleSubscriptionClick = () => {
    console.log('Subscription clicked');
  };

  const handleChangePassword = async () => {
    setPasswordResetError('');
    setPasswordResetLoading(true);
    
    try {
      const response = await profileService.requestPasswordReset();
      setPasswordResetSent(true);
      setPasswordResetError('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка при отправке письма';
      setPasswordResetError(message);
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handleGarage = () => {
    console.log('Garage clicked');
  };

  const handleImportData = () => {
    console.log('Import data clicked');
  };

  const handleSaveName = async () => {
    setSavingName(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const response = await profileService.updateName(name);
      setOriginalName(name);
      setUser(response.user);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      const status = error.response?.status;
      
      if (status === 422) {
        setSaveError('Ошибка валидации данных');
      } else if (status === 500) {
        setSaveError('Ошибка сервера. Попробуйте позже');
      } else {
        setSaveError('Произошла ошибка при сохранении');
      }
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelNameEdit = () => {
    setName(originalName);
    setSaveError('');
  };

  const isNameChanged = name !== originalName;

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', paddingTop: '100px', color: 'var(--text-secondary)' }}>
          Загрузка...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.gridCell}></div>
      <div className={styles.gridCell}></div>
      <div className={styles.gridCell}></div>
      <div className={styles.gridCell}></div>
      <div className={styles.gridCell}></div>
      <div className={styles.gridCell}></div>
      <div className={styles.gridCell}></div>
      <div className={styles.gridCell}></div>
      
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}></div>
          <div className={styles.logoText}>Corstat</div>
        </div>
        
        <button className={styles.logoutButton} onClick={handleLogout} title="Выход">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      <div className={styles.content}>
        {registrationSuccess && (
          <div style={{
            padding: '16px 20px',
            background: 'rgba(67, 181, 129, 0.15)',
            border: '1px solid var(--success-green)',
            borderRadius: '8px',
            marginBottom: '24px',
            color: 'var(--success-green)',
            fontSize: '15px',
            textAlign: 'center'
          }}>
            Регистрация успешно завершена! Добро пожаловать в систему Corstat.
          </div>
        )}

        <div className={styles.profileCard}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Профиль пользователя</h1>
            <p className={styles.cardSubtitle}>Управление вашим аккаунтом</p>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Основная информация</h2>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  className={styles.input}
                  value={user.email || ''}
                  disabled
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Имя</label>
                <input
                  type="text"
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите ваше имя"
                />
                {isNameChanged && (
                  <div className={styles.saveButtonContainer}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={handleCancelNameEdit}
                      disabled={savingName}
                    >
                      Отменить
                    </button>
                    <button
                      type="button"
                      className={styles.saveButton}
                      onClick={handleSaveName}
                      disabled={savingName}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{savingName ? 'Сохранение...' : 'Сохранить'}</span>
                    </button>
                  </div>
                )}
                {saveSuccess && (
                  <div className={styles.successMessage}>
                    Имя успешно обновлено
                  </div>
                )}
                {saveError && (
                  <div className={styles.errorMessage}>
                    {saveError}
                  </div>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Подписка</label>
                <div 
                  className={styles.subscriptionBadge}
                  onClick={handleSubscriptionClick}
                >
                  <span className={styles.subscriptionLabel}>Тариф:</span>
                  <span className={styles.subscriptionValue}>Standard</span>
                </div>
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Безопасность</h2>
              
              <div className={styles.buttonGrid}>
                <button 
                  className={styles.actionButton}
                  onClick={handleChangePassword}
                  disabled={passwordResetSent || passwordResetLoading}
                >
                  {passwordResetLoading ? (
                    <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="20" height="20">
                      <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  )}
                  <span>{passwordResetLoading ? 'Отправка...' : 'Сменить пароль'}</span>
                </button>
              </div>
              
              {passwordResetSent && (
                <div className={styles.passwordResetSuccess}>
                  Письмо с инструкциями отправлено на ваш email
                </div>
              )}
              
              {passwordResetError && (
                <div className={styles.passwordResetError}>
                  {passwordResetError}
                </div>
              )}
            </div>

            <div className={styles.divider}></div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Инструменты</h2>
              
              <div className={styles.buttonGrid}>
                <button 
                  className={styles.actionButton}
                  onClick={handleGarage}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Гараж</span>
                </button>

                <button 
                  className={`${styles.actionButton} ${styles.primary}`}
                  onClick={handleImportData}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Импорт данных</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

