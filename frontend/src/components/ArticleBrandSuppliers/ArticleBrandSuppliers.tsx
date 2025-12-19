'use client';

import { Supplier } from '@/services/reverse-genetic-algorithm.service';
import styles from './ArticleBrandSuppliers.module.css';

interface ArticleBrandSuppliersProps {
  suppliers: Supplier[];
  articleBrand: { article: string; brand: string };
  loading?: boolean;
}

export default function ArticleBrandSuppliers({ suppliers, articleBrand, loading = false }: ArticleBrandSuppliersProps) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Топ поставщиков</h3>
          <p className={styles.subtitle}>{articleBrand.article} × {articleBrand.brand}</p>
        </div>
        <div className={styles.content}>
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>Загрузка данных...</p>
          </div>
        </div>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Топ поставщиков</h3>
          <p className={styles.subtitle}>{articleBrand.article} × {articleBrand.brand}</p>
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
        <h3 className={styles.title}>Топ поставщиков</h3>
        <p className={styles.subtitle}>{articleBrand.article} × {articleBrand.brand}</p>
      </div>
      <div className={styles.content}>
        <div className={styles.list}>
          {suppliers.map((supplier, index) => (
            <div key={`${supplier.supplier_id}-${index}`} className={styles.supplierItem}>
              <div className={styles.rank}>
                <span className={styles.rankNumber}>{index + 1}</span>
              </div>
              <div className={styles.supplierInfo}>
                <div className={styles.supplierName}>{supplier.service_name || supplier.supplier_name}</div>
                {supplier.metrics && (
                  <div className={styles.supplierDetails}>
                    <span className={styles.metric}>
                      Цена: {supplier.metrics.avg_price.toFixed(2)} ₽
                    </span>
                    <span className={styles.metric}>
                      Успешность: {supplier.metrics.success_rate.toFixed(1)}%
                    </span>
                    <span className={styles.metric}>
                      Доставка: {supplier.metrics.avg_delivery_time.toFixed(0)} дн.
                    </span>
                    <span className={styles.metric}>
                      Отказы: {supplier.metrics.denial_rate.toFixed(1)}%
                    </span>
                    <span className={styles.metric}>
                      Заказов: {supplier.metrics.orders_count}
                    </span>
                    <span className={styles.metric}>
                      Выручка: {supplier.metrics.total_revenue.toFixed(2)} ₽
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

