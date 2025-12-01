import styles from './SuccessMessage.module.css';

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export default function SuccessMessage({ message, className }: SuccessMessageProps) {
  return (
    <div className={className || styles.successMessage}>
      {message}
    </div>
  );
}

