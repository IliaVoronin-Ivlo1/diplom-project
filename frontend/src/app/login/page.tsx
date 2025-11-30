'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import { LoginRequest, RegisterRequest, ValidationError } from '@/models/auth.model';
import styles from './login.module.css';

type FormMode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>('login');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [loginData, setLoginData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState<RegisterRequest>({
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError>({});

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
    setValidationErrors({});
  };

  const handleModeChange = (newMode: FormMode) => {
    setMode(newMode);
    clearMessages();
  };

  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRegisterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const response = await authService.login(loginData);
      
      if (response.token) {
        authService.setToken(response.token);
      }
      
      setSuccessMessage(response.message || 'Успешная авторизация');
      
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error: any) {
      const status = error.response?.status;
      
      if (status === 422) {
        setValidationErrors(error.response?.data?.errors || {});
        setErrorMessage('Проверьте правильность введенных данных');
      } else if (status === 400) {
        setErrorMessage(error.response?.data?.message || 'Ошибка клиента');
      } else if (status === 500) {
        setErrorMessage('Ошибка сервера. Попробуйте позже');
      } else {
        setErrorMessage(error.response?.data?.message || 'Произошла ошибка при авторизации');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const response = await authService.register(registerData);
      
      if (response.token) {
        authService.setToken(response.token);
      }
      
      setSuccessMessage(response.message || 'Успешная регистрация');
      
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error: any) {
      const status = error.response?.status;
      
      if (status === 422) {
        setValidationErrors(error.response?.data?.errors || {});
        setErrorMessage('Проверьте правильность введенных данных');
      } else if (status === 400) {
        setErrorMessage(error.response?.data?.message || 'Ошибка клиента');
      } else if (status === 500) {
        setErrorMessage('Ошибка сервера. Попробуйте позже');
      } else {
        setErrorMessage(error.response?.data?.message || 'Произошла ошибка при регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.gridLine} ${styles.gridLineHorizontal}`}></div>
      <div className={`${styles.gridLine} ${styles.gridLineVertical}`}></div>
      <div className={`${styles.gridLine} ${styles.gridLineHorizontal}`}></div>
      <div className={`${styles.gridLine} ${styles.gridLineVertical}`}></div>
      <div className={`${styles.gridLine} ${styles.gridLineHorizontal}`}></div>
      <div className={`${styles.gridLine} ${styles.gridLineVertical}`}></div>
      <div className={`${styles.gridLine} ${styles.gridLineHorizontal}`}></div>
      <div className={`${styles.gridLine} ${styles.gridLineVertical}`}></div>
      <div className={`${styles.gridLine} ${styles.gridLineHorizontal}`}></div>
      <div className={`${styles.gridLine} ${styles.gridLineVertical}`}></div>
      
      <div className={styles.formWrapper}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}></div>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'login' ? styles.active : ''}`}
            onClick={() => handleModeChange('login')}
          >
            Вход
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'register' ? styles.active : ''}`}
            onClick={() => handleModeChange('register')}
          >
            Регистрация
          </button>
        </div>

        {mode === 'login' ? (
          <form className={styles.form} onSubmit={handleLoginSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                className={`${styles.input} ${validationErrors.email ? styles.error : ''}`}
                placeholder="example@corstat.com"
                value={loginData.email}
                onChange={handleLoginChange}
                required
                disabled={loading}
              />
              {validationErrors.email && (
                <span className={styles.errorText}>{validationErrors.email[0]}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="login-password">
                Пароль
              </label>
              <input
                id="login-password"
                type="password"
                name="password"
                className={`${styles.input} ${validationErrors.password ? styles.error : ''}`}
                placeholder="Введите пароль"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                disabled={loading}
              />
              {validationErrors.password && (
                <span className={styles.errorText}>{validationErrors.password[0]}</span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              <span>{loading ? 'Вход...' : 'Войти'}</span>
            </button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleRegisterSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="register-email">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                name="email"
                className={`${styles.input} ${validationErrors.email ? styles.error : ''}`}
                placeholder="example@corstat.com"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
                disabled={loading}
              />
              {validationErrors.email && (
                <span className={styles.errorText}>{validationErrors.email[0]}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="register-password">
                Пароль
              </label>
              <input
                id="register-password"
                type="password"
                name="password"
                className={`${styles.input} ${validationErrors.password ? styles.error : ''}`}
                placeholder="Введите пароль"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
                disabled={loading}
              />
              {validationErrors.password && (
                <span className={styles.errorText}>{validationErrors.password[0]}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="register-password-confirmation">
                Повторите пароль
              </label>
              <input
                id="register-password-confirmation"
                type="password"
                name="password_confirmation"
                className={`${styles.input} ${validationErrors.password_confirmation ? styles.error : ''}`}
                placeholder="Повторите пароль"
                value={registerData.password_confirmation}
                onChange={handleRegisterChange}
                required
                disabled={loading}
              />
              {validationErrors.password_confirmation && (
                <span className={styles.errorText}>{validationErrors.password_confirmation[0]}</span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              <span>{loading ? 'Регистрация...' : 'Зарегистрироваться'}</span>
            </button>
          </form>
        )}

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
      </div>
    </div>
  );
}

