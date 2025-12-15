'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import authService from '@/services/auth.service';
import profileService from '@/services/profile.service';
import ProfileHeader from '@/components/ProfileHeader/ProfileHeader';
import ProfileCard from '@/components/ProfileCard/ProfileCard';
import ProfileBackground from '@/components/ProfileBackground/ProfileBackground';
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

  const handleAdminPanel = () => {
    router.push('/admin');
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
      <ProfileBackground />
      
      <ProfileHeader onLogout={handleLogout} />

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

        <ProfileCard
          user={user}
          name={name}
          isNameChanged={isNameChanged}
          savingName={savingName}
          saveSuccess={saveSuccess}
          saveError={saveError}
          passwordResetSent={passwordResetSent}
          passwordResetError={passwordResetError}
          passwordResetLoading={passwordResetLoading}
          onNameChange={setName}
          onSaveName={handleSaveName}
          onCancelNameEdit={handleCancelNameEdit}
          onChangePassword={handleChangePassword}
          onGarage={handleGarage}
          onImportData={handleImportData}
          onSubscriptionClick={handleSubscriptionClick}
          onAdminPanel={user.role === 'Admin' ? handleAdminPanel : undefined}
        />
      </div>
    </div>
  );
}

