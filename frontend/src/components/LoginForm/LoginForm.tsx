import { FormEvent, ChangeEvent } from 'react';
import { LoginRequest, ValidationError } from '@/models/auth.model';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  loginData: LoginRequest;
  loading: boolean;
  validationErrors: ValidationError;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function LoginForm({ 
  loginData, 
  loading, 
  validationErrors, 
  onSubmit, 
  onChange 
}: LoginFormProps) {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
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
          onChange={onChange}
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
          onChange={onChange}
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
  );
}

