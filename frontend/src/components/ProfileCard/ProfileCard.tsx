import SuccessMessage from '@/components/messages/SuccessMessage/SuccessMessage';
import ErrorMessage from '@/components/messages/ErrorMessage/ErrorMessage';
import styles from './ProfileCard.module.css';

interface ProfileCardProps {
  user: any;
  name: string;
  isNameChanged: boolean;
  savingName: boolean;
  saveSuccess: boolean;
  saveError: string;
  passwordResetSent: boolean;
  passwordResetError: string;
  passwordResetLoading: boolean;
  onNameChange: (value: string) => void;
  onSaveName: () => void;
  onCancelNameEdit: () => void;
  onChangePassword: () => void;
  onGarage: () => void;
  onImportData: () => void;
  onSubscriptionClick: () => void;
  onAdminPanel?: () => void;
}

export default function ProfileCard({
  user,
  name,
  isNameChanged,
  savingName,
  saveSuccess,
  saveError,
  passwordResetSent,
  passwordResetError,
  passwordResetLoading,
  onNameChange,
  onSaveName,
  onCancelNameEdit,
  onChangePassword,
  onGarage,
  onImportData,
  onSubscriptionClick,
  onAdminPanel
}: ProfileCardProps) {
  return (
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
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Введите ваше имя"
            />
            {isNameChanged && (
              <div className={styles.saveButtonContainer}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onCancelNameEdit}
                  disabled={savingName}
                >
                  Отменить
                </button>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={onSaveName}
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
              <SuccessMessage message="Имя успешно обновлено" className={styles.successMessage} />
            )}
            {saveError && (
              <ErrorMessage message={saveError} className={styles.errorMessage} />
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Подписка</label>
            <div 
              className={styles.subscriptionBadge}
              onClick={onSubscriptionClick}
            >
              <span className={styles.subscriptionLabel}>Тариф:</span>
              <span className={styles.subscriptionValue}>{user.role || 'Visiter'}</span>
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Безопасность</h2>
          
          <div className={styles.buttonGrid}>
            <button 
              className={styles.actionButton}
              onClick={onChangePassword}
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
            <SuccessMessage 
              message="Письмо с инструкциями отправлено на ваш email" 
              className={styles.passwordResetSuccess} 
            />
          )}
          
          {passwordResetError && (
            <ErrorMessage 
              message={passwordResetError} 
              className={styles.passwordResetError} 
            />
          )}
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Инструменты</h2>
          
          <div className={styles.buttonGrid}>
            <button 
              className={styles.actionButton}
              onClick={onGarage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Гараж</span>
            </button>

            <button 
              className={`${styles.actionButton} ${styles.primary}`}
              onClick={onImportData}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Импорт данных</span>
            </button>
          </div>
        </div>

        {user.role === 'Admin' && onAdminPanel && (
          <>
            <div className={styles.divider}></div>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Администрирование</h2>
              <div className={styles.buttonGrid}>
                <button 
                  className={`${styles.actionButton} ${styles.admin}`}
                  onClick={onAdminPanel}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Админ панель</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

