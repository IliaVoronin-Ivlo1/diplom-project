'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import profileService from '@/services/profile.service';
import AnimatedBackground from '@/components/AnimatedBackground/AnimatedBackground';
import SuccessMessage from '@/components/messages/SuccessMessage/SuccessMessage';
import ErrorMessage from '@/components/messages/ErrorMessage/ErrorMessage';
import styles from '../login/login.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({});
  
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!email || !token) {
      setErrorMessage('Неверная ссылка для смены пароля');
    }
  }, [email, token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !token) {
      setErrorMessage('Неверные параметры запроса');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setValidationErrors({});
    setLoading(true);

    try {
      const response = await profileService.resetPassword(email, token, password, passwordConfirmation);
      
      setSuccessMessage(response.message || 'Пароль успешно изменен');
      setPassword('');
      setPasswordConfirmation('');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      const status = error.response?.status;
      
      if (status === 422) {
        setValidationErrors(error.response?.data?.errors || {});
        setErrorMessage('Проверьте правильность введенных данных');
      } else if (status === 404) {
        setErrorMessage('Токен не найден');
      } else if (status === 401) {
        setErrorMessage('Неверный токен');
      } else if (status === 410) {
        setErrorMessage('Срок действия ссылки истек. Запросите смену пароля повторно');
      } else if (status === 500) {
        setErrorMessage('Ошибка сервера. Попробуйте позже');
      } else {
        setErrorMessage(error.response?.data?.message || 'Произошла ошибка при смене пароля');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <AnimatedBackground />
      
      <div className={styles.formWrapper}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}></div>
        </div>

        <h2 style={{ 
          textAlign: 'center', 
          color: 'var(--text-primary)', 
          marginBottom: '24px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Смена пароля
        </h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">
              Новый пароль
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className={`${styles.input} ${validationErrors.password ? styles.error : ''}`}
              placeholder="Введите новый пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || !email || !token}
            />
            {validationErrors.password && (
              <span className={styles.errorText}>{validationErrors.password[0]}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password-confirmation">
              Подтвердите новый пароль
            </label>
            <input
              id="password-confirmation"
              type="password"
              name="password_confirmation"
              className={`${styles.input} ${validationErrors.password_confirmation ? styles.error : ''}`}
              placeholder="Повторите новый пароль"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              disabled={loading || !email || !token}
            />
            {validationErrors.password_confirmation && (
              <span className={styles.errorText}>{validationErrors.password_confirmation[0]}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !email || !token}
          >
            <span>{loading ? 'Сохранение...' : 'Сменить пароль'}</span>
          </button>
        </form>

        {successMessage && (
          <SuccessMessage message={successMessage} />
        )}

        {errorMessage && (
          <ErrorMessage message={errorMessage} />
        )}
      </div>
    </div>
  );
}

