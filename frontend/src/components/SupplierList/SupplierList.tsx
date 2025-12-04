'use client';

import { useState } from 'react';
import { Supplier } from '@/services/genetic-algorithm.service';
import styles from './SupplierList.module.css';

interface SupplierListProps {
  suppliers: Supplier[];
  selectedSupplierId: number | null;
  onSupplierSelect: (supplier: Supplier) => void;
  loading?: boolean;
}

export default function SupplierList({ 
  suppliers, 
  selectedSupplierId, 
  onSupplierSelect,
  loading = false 
}: SupplierListProps) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Рейтинг поставщиков</h3>
          <p className={styles.subtitle}>От лучшего к худшему</p>
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
          <h3 className={styles.title}>Рейтинг поставщиков</h3>
          <p className={styles.subtitle}>От лучшего к худшему</p>
        </div>
        <div className={styles.content}>
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>Нет данных для отображения</p>
            <p className={styles.placeholderSubtext}>Запустите генетический алгоритм для получения данных</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Рейтинг поставщиков</h3>
        <p className={styles.subtitle}>От лучшего к худшему</p>
      </div>
      <div className={styles.content}>
        <div className={styles.list}>
          {suppliers.map((supplier, index) => (
            <div
              key={supplier.id}
              className={`${styles.supplierItem} ${selectedSupplierId === supplier.id ? styles.selected : ''} ${index === 0 ? styles.best : ''}`}
              onClick={() => onSupplierSelect(supplier)}
            >
              <div className={styles.rank}>
                <span className={styles.rankNumber}>{index + 1}</span>
              </div>
              <div className={styles.supplierInfo}>
                <div className={styles.supplierName}>{supplier.service_name || supplier.name}</div>
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
              <div className={styles.arrow}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

