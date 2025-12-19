'use client';

import { SeasonalityData } from '@/services/price-forecasting.service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import styles from './SeasonalityChart.module.css';

interface SeasonalityChartProps {
  data: SeasonalityData | null;
  loading?: boolean;
}

const MONTH_NAMES = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export default function SeasonalityChart({ data, loading = false }: SeasonalityChartProps) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка данных сезонности...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>Выберите автозапчасть для отображения сезонности</div>
      </div>
    );
  }

  const monthlyData = data.monthly_coefficients ? Object.entries(data.monthly_coefficients).map(([month, coefficient]) => ({
    month: MONTH_NAMES[parseInt(month) - 1] || `М${month}`,
    coefficient: coefficient,
    value: coefficient
  })) : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Анализ сезонности: {data.article}/{data.brand}</h3>
      </div>
      
      <div className={styles.charts}>
        {monthlyData.length > 0 && (
          <div className={styles.chartSection}>
            <h4 className={styles.sectionTitle}>Месячные коэффициенты</h4>
            <div className={styles.chartContent}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" opacity={0.3} />
                  <XAxis 
                    dataKey="month"
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
                  <Bar 
                    dataKey="coefficient" 
                    fill="var(--accent-blue)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {data.trend && (
          <div className={styles.chartSection}>
            <h4 className={styles.sectionTitle}>Тренд</h4>
            <div className={styles.trendInfo}>
              <div className={styles.trendItem}>
                <span className={styles.trendLabel}>Направление:</span>
                <span className={styles.trendValue}>
                  {data.trend.direction === 'increasing' ? 'Рост' : 
                   data.trend.direction === 'decreasing' ? 'Снижение' : 'Стабильный'}
                </span>
              </div>
              <div className={styles.trendItem}>
                <span className={styles.trendLabel}>Сила тренда:</span>
                <span className={styles.trendValue}>{(data.trend.strength * 100).toFixed(2)}%</span>
              </div>
              <div className={styles.trendItem}>
                <span className={styles.trendLabel}>Текущее значение:</span>
                <span className={styles.trendValue}>{data.trend.current_value.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

