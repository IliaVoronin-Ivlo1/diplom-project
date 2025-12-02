'use client';

import { ArticleBrandCombination } from '@/services/genetic-algorithm.service';
import styles from './SupplierCombinations.module.css';

interface SupplierCombinationsProps {
  combinations: ArticleBrandCombination[];
  supplierName: string;
  onClose: () => void;
  loading?: boolean;
}

export default function SupplierCombinations({ combinations, supplierName, onClose, loading = false }: SupplierCombinationsProps) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Топ артикул-брендов</h3>
          <p className={styles.subtitle}>{supplierName}</p>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>Загрузка данных...</p>
          </div>
        </div>
      </div>
    );
  }

  if (combinations.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Топ артикул-брендов</h3>
          <p className={styles.subtitle}>{supplierName}</p>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>Нет данных для отображения</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Топ артикул-брендов</h3>
        <p className={styles.subtitle}>{supplierName}</p>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className={styles.content}>
        <div className={styles.list}>
          {combinations.map((combination, index) => (
            <div key={`${combination.article}-${combination.brand}-${index}`} className={styles.combinationItem}>
              <div className={styles.rank}>
                <span className={styles.rankNumber}>{index + 1}</span>
              </div>
              <div className={styles.combinationInfo}>
                <div className={styles.combinationName}>
                  <span className={styles.article}>{combination.article}</span>
                  <span className={styles.separator}>×</span>
                  <span className={styles.brand}>{combination.brand}</span>
                </div>
                <div className={styles.combinationDetails}>
                  <span className={styles.fitnessScore}>
                    Fitness: {combination.fitness_score.toFixed(3)}
                  </span>
                  {combination.metrics && (
                    <>
                      <span className={styles.metric}>
                        Цена: {typeof combination.metrics.avg_price === 'number' ? combination.metrics.avg_price.toFixed(2) : '0.00'} ₽
                      </span>
                      <span className={styles.metric}>
                        Успешность: {typeof combination.metrics.success_rate === 'number' ? combination.metrics.success_rate.toFixed(1) : '0.0'}%
                      </span>
                      <span className={styles.metric}>
                        Доставка: {typeof combination.metrics.avg_delivery_time === 'number' ? combination.metrics.avg_delivery_time.toFixed(0) : '0'} дн.
                      </span>
                      <span className={styles.metric}>
                        Отказы: {typeof combination.metrics.denial_rate === 'number' ? combination.metrics.denial_rate.toFixed(1) : '0.0'}%
                      </span>
                      <span className={styles.metric}>
                        Заказов: {typeof combination.metrics.orders_count === 'number' ? combination.metrics.orders_count : 0}
                      </span>
                      <span className={styles.metric}>
                        Выручка: {typeof combination.metrics.total_revenue === 'number' ? combination.metrics.total_revenue.toFixed(2) : '0.00'} ₽
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

