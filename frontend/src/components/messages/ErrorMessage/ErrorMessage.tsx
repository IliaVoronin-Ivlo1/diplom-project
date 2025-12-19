import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export default function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <div className={className || styles.errorMessage}>
      {message}
    </div>
  );
}

