'use client';

import { ForecastData } from '@/services/price-forecasting.service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import styles from './ForecastChart.module.css';

interface ForecastChartProps {
  data: ForecastData | null;
  loading?: boolean;
}

export default function ForecastChart({ data, loading = false }: ForecastChartProps) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка данных прогнозирования...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>Выберите автозапчасть для отображения прогноза</div>
      </div>
    );
  }

  const chartData = data.forecast_data?.map((item) => ({
    date: new Date(item.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
    price: item.price,
    lower: item.confidence_lower || item.price * 0.95,
    upper: item.confidence_upper || item.price * 1.05,
    timestamp: new Date(item.date).getTime()
  })) || [];

  const metrics = data.accuracy_metrics;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Прогноз цен: {data.article}/{data.brand}</h3>
        {metrics && (
          <div className={styles.metrics}>
            {metrics.mae && <span className={styles.metric}>MAE: {metrics.mae.toFixed(2)}</span>}
            {metrics.rmse && <span className={styles.metric}>RMSE: {metrics.rmse.toFixed(2)}</span>}
            {metrics.mape && <span className={styles.metric}>MAPE: {metrics.mape.toFixed(2)}%</span>}
          </div>
        )}
      </div>
      
      <div className={styles.chartContent}>
        <ResponsiveContainer width="100%" height={500}>
          <AreaChart data={chartData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" opacity={0.3} />
            <XAxis 
              dataKey="date"
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
              cursor={{ strokeDasharray: '3 3' }}
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
            <Area 
              type="monotone" 
              dataKey="upper" 
              stroke="none" 
              fill="rgba(74, 158, 255, 0.1)" 
              name="Верхняя граница"
            />
            <Area 
              type="monotone" 
              dataKey="lower" 
              stroke="none" 
              fill="rgba(74, 158, 255, 0.1)" 
              name="Нижняя граница"
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="var(--accent-blue)" 
              strokeWidth={3}
              dot={{ fill: 'var(--accent-blue)', r: 4 }}
              activeDot={{ r: 6 }}
              name="Прогноз цены"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

