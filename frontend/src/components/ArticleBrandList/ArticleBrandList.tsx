'use client';

import { ArticleBrand } from '@/services/reverse-genetic-algorithm.service';
import styles from './ArticleBrandList.module.css';

interface ArticleBrandListProps {
  articleBrands: ArticleBrand[];
  selectedArticleBrand: { article: string; brand: string } | null;
  onArticleBrandSelect: (articleBrand: ArticleBrand) => void;
  loading?: boolean;
}

export default function ArticleBrandList({ 
  articleBrands, 
  selectedArticleBrand, 
  onArticleBrandSelect,
  loading = false 
}: ArticleBrandListProps) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Рейтинг автозапчастей</h3>
          <p className={styles.subtitle}>От лучшей к худшей</p>
        </div>
        <div className={styles.content}>
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>Загрузка данных...</p>
          </div>
        </div>
      </div>
    );
  }

  if (articleBrands.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Рейтинг автозапчастей</h3>
          <p className={styles.subtitle}>От лучшей к худшей</p>
        </div>
        <div className={styles.content}>
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>Нет данных для отображения</p>
            <p className={styles.placeholderSubtext}>Запустите обратный генетический алгоритм для получения данных</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Рейтинг автозапчастей</h3>
        <p className={styles.subtitle}>От лучшей к худшей</p>
      </div>
      <div className={styles.content}>
        <div className={styles.list}>
          {articleBrands.map((articleBrand, index) => {
            const isSelected = selectedArticleBrand?.article === articleBrand.article && 
                              selectedArticleBrand?.brand === articleBrand.brand;
            return (
              <div
                key={`${articleBrand.article}-${articleBrand.brand}-${index}`}
                className={`${styles.articleBrandItem} ${isSelected ? styles.selected : ''} ${index === 0 ? styles.best : ''}`}
                onClick={() => onArticleBrandSelect(articleBrand)}
              >
                <div className={styles.rank}>
                  <span className={styles.rankNumber}>{index + 1}</span>
                </div>
                <div className={styles.articleBrandInfo}>
                  <div className={styles.articleBrandName}>
                    <span className={styles.article}>{articleBrand.article}</span>
                    <span className={styles.separator}>×</span>
                    <span className={styles.brand}>{articleBrand.brand}</span>
                  </div>
                  {articleBrand.metrics && (
                    <div className={styles.articleBrandDetails}>
                      <span className={styles.fitnessScore}>
                        Fitness: {articleBrand.fitness_score.toFixed(3)}
                      </span>
                      <span className={styles.metric}>
                        Цена: {articleBrand.metrics.avg_price.toFixed(2)} ₽
                      </span>
                      <span className={styles.metric}>
                        Успешность: {articleBrand.metrics.success_rate.toFixed(1)}%
                      </span>
                      <span className={styles.metric}>
                        Доставка: {articleBrand.metrics.avg_delivery_time.toFixed(0)} дн.
                      </span>
                      <span className={styles.metric}>
                        Отказы: {articleBrand.metrics.denial_rate.toFixed(1)}%
                      </span>
                      <span className={styles.metric}>
                        Заказов: {articleBrand.metrics.orders_count}
                      </span>
                      <span className={styles.metric}>
                        Выручка: {articleBrand.metrics.total_revenue.toFixed(2)} ₽
                      </span>
                    </div>
                  )}
                </div>
                <div className={styles.arrow}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

