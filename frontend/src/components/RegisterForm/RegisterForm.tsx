import { FormEvent, ChangeEvent } from 'react';
import { RegisterRequest, ValidationError } from '@/models/auth.model';
import styles from './RegisterForm.module.css';

interface RegisterFormProps {
  registerData: RegisterRequest;
  loading: boolean;
  validationErrors: ValidationError;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function RegisterForm({ 
  registerData, 
  loading, 
  validationErrors, 
  onSubmit, 
  onChange 
}: RegisterFormProps) {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
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
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
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
  );
}

