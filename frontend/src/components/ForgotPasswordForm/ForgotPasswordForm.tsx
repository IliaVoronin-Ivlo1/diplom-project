import { FormEvent } from 'react';
import SuccessMessage from '@/components/messages/SuccessMessage/SuccessMessage';
import ErrorMessage from '@/components/messages/ErrorMessage/ErrorMessage';
import styles from './ForgotPasswordForm.module.css';

interface ForgotPasswordFormProps {
  email: string;
  loading: boolean;
  success: boolean;
  error: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onEmailChange: (value: string) => void;
  onBack: () => void;
}

export default function ForgotPasswordForm({
  email,
  loading,
  success,
  error,
  onSubmit,
  onEmailChange,
  onBack
}: ForgotPasswordFormProps) {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="forgot-email">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          className={styles.input}
          placeholder="example@corstat.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={loading}
      >
        <span>{loading ? 'Отправка...' : 'Отправить письмо'}</span>
      </button>

      <button
        type="button"
        className={styles.backButton}
        onClick={onBack}
      >
        Назад к входу
      </button>

      {success && (
        <SuccessMessage message="Письмо с инструкциями отправлено на ваш email" />
      )}

      {error && (
        <ErrorMessage message={error} />
      )}
    </form>
  );
}

