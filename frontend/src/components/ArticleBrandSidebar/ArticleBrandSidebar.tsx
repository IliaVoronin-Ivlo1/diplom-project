'use client';

import { ArticleBrand } from '@/services/price-forecasting.service';
import styles from './ArticleBrandSidebar.module.css';

interface ArticleBrandSidebarProps {
  items: ArticleBrand[];
  selectedItem: ArticleBrand | null;
  onItemSelect: (item: ArticleBrand) => void;
  loading?: boolean;
}

export default function ArticleBrandSidebar({ 
  items, 
  selectedItem, 
  onItemSelect, 
  loading = false 
}: ArticleBrandSidebarProps) {
  if (loading) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.empty}>Нет доступных автозапчастей</div>
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h3 className={styles.title}>Автозапчасти</h3>
        <span className={styles.count}>({items.length})</span>
      </div>
      <div className={styles.list}>
        {items.map((item) => (
          <button
            key={`${item.article}-${item.brand}`}
            type="button"
            className={`${styles.item} ${selectedItem?.article === item.article && selectedItem?.brand === item.brand ? styles.active : ''}`}
            onClick={() => onItemSelect(item)}
          >
            <span className={styles.itemText}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

