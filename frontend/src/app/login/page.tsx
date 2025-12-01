'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import authService from '@/services/auth.service';
import profileService from '@/services/profile.service';
import { LoginRequest, RegisterRequest, ValidationError } from '@/models/auth.model';
import LoginForm from '@/components/LoginForm/LoginForm';
import RegisterForm from '@/components/RegisterForm/RegisterForm';
import ForgotPasswordForm from '@/components/ForgotPasswordForm/ForgotPasswordForm';
import AnimatedBackground from '@/components/AnimatedBackground/AnimatedBackground';
import SuccessMessage from '@/components/messages/SuccessMessage/SuccessMessage';
import ErrorMessage from '@/components/messages/ErrorMessage/ErrorMessage';
import styles from './login.module.css';

type FormMode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<FormMode>('login');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      switch (error) {
        case 'invalid_token':
          setErrorMessage('Неверная или устаревшая ссылка подтверждения');
          break;
        case 'token_expired':
          setErrorMessage('Срок действия ссылки истек. Пожалуйста, зарегистрируйтесь снова');
          break;
        case 'server_error':
          setErrorMessage('Произошла ошибка сервера. Попробуйте позже');
          break;
      }
      window.history.replaceState({}, '', '/login');
    }
  }, []);

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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
    setValidationErrors({});
  };

  const handleModeChange = (newMode: FormMode) => {
    setMode(newMode);
    clearMessages();
    setShowForgotPassword(false);
    setForgotSuccess(false);
    setForgotError('');
    setLoginFailed(false);
  };

  const handleForgotPasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess(false);
    setForgotLoading(true);

    try {
      const response = await profileService.forgotPassword(forgotEmail);
      setForgotSuccess(true);
      setForgotEmail('');
    } catch (error: any) {
      const status = error.response?.status;
      
      if (status === 422) {
        setForgotError(error.response?.data?.message || 'Проверьте правильность email');
      } else if (status === 500) {
        setForgotError('Ошибка сервера. Попробуйте позже');
      } else {
        setForgotError(error.response?.data?.message || 'Произошла ошибка');
      }
    } finally {
      setForgotLoading(false);
    }
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
      setLoginFailed(false);
      
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (error: any) {
      const status = error.response?.status;
      
      if (status === 401) {
        setErrorMessage(error.response?.data?.message || 'Неверный email или пароль');
        setLoginFailed(true);
      } else if (status === 422) {
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
      
      setSuccessMessage(response.message || 'Письмо с подтверждением отправлено на ваш email');
      
      setRegisterData({
        email: '',
        password: '',
        password_confirmation: '',
      });
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
      <AnimatedBackground />
      
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
          showForgotPassword ? (
            <ForgotPasswordForm
              email={forgotEmail}
              loading={forgotLoading}
              success={forgotSuccess}
              error={forgotError}
              onSubmit={handleForgotPasswordSubmit}
              onEmailChange={setForgotEmail}
              onBack={() => {
                setShowForgotPassword(false);
                setForgotSuccess(false);
                setForgotError('');
              }}
            />
          ) : (
            <>
              <LoginForm
                loginData={loginData}
                loading={loading}
                validationErrors={validationErrors}
                onSubmit={handleLoginSubmit}
                onChange={handleLoginChange}
              />
              
              {successMessage && (
                <SuccessMessage message={successMessage} />
              )}

              {errorMessage && (
                <ErrorMessage message={errorMessage} />
              )}
              
              {loginFailed && (
                <button
                  type="button"
                  className={styles.forgotPasswordLink}
                  onClick={() => setShowForgotPassword(true)}
                >
                  Забыли пароль?
                </button>
              )}
            </>
          )
        ) : (
          <>
            <RegisterForm
              registerData={registerData}
              loading={loading}
              validationErrors={validationErrors}
              onSubmit={handleRegisterSubmit}
              onChange={handleRegisterChange}
            />
            
            {successMessage && (
              <SuccessMessage message={successMessage} />
            )}

            {errorMessage && (
              <ErrorMessage message={errorMessage} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

