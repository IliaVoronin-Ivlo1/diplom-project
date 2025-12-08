'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import supplierOrdersStatisticsService, { SupplierOrderStat } from '@/services/supplier-orders-statistics.service';
import styles from './AnalysisStatisticsChart.module.css';

const COLORS = {
  successful: '#4a9eff',
  failed: '#ffa500'
};

export default function AnalysisStatisticsChart() {
  const [data, setData] = useState<SupplierOrderStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const response = await supplierOrdersStatisticsService.getSupplierOrdersStatistics(10);
        console.log('Statistics response:', response);
        const statistics = response.statistics || [];
        console.log('Statistics data:', statistics);
        console.log('Statistics length:', statistics.length);
        setData(statistics);
      } catch (err) {
        console.error('Error loading supplier orders statistics:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  const chartData = data.map((item) => {
    const result = {
      name: item.supplier_name || 'Неизвестный',
      successful: Number(item.successful_orders) || 0,
      failed: Number(item.failed_orders) || 0
    };
    return result;
  });

  console.log('Data state:', data);
  console.log('Chart data:', chartData);
  console.log('Chart data length:', chartData.length);

  if (loading) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Статистика заказов по поставщикам</h3>
          <p className={styles.chartSubtitle}>Соотношение успешных и неуспешных заказов</p>
        </div>
        <div className={styles.chartContent}>
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>Загрузка данных...</p>
          </div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Статистика заказов по поставщикам</h3>
          <p className={styles.chartSubtitle}>Соотношение успешных и неуспешных заказов</p>
        </div>
        <div className={styles.chartContent}>
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>Нет данных для отображения</p>
            <p className={styles.placeholderSubtext}>Данные по заказам отсутствуют</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Статистика заказов по поставщикам</h3>
        <p className={styles.chartSubtitle}>Соотношение успешных и неуспешных заказов</p>
      </div>
      <div className={styles.chartContent}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" opacity={0.3} />
            <XAxis 
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            />
            <YAxis 
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)' }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(74, 158, 255, 0.1)' }}
              contentStyle={{
                backgroundColor: 'var(--secondary-dark)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                color: 'var(--text-primary)'
              }}
            />
            <Legend 
              wrapperStyle={{ color: 'var(--text-primary)' }}
            />
            <Bar 
              dataKey="successful" 
              name="Успешные заказы"
              fill={COLORS.successful}
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="failed" 
              name="Отказы"
              fill={COLORS.failed}
              radius={[0, 0, 8, 8]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
