import styles from './AnimatedBackground.module.css';

export default function AnimatedBackground() {
  return (
    <>
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
    </>
  );
}

