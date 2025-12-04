'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, TooltipProps } from 'recharts';
import { Supplier } from '@/services/genetic-algorithm.service';
import styles from './SupplierChart.module.css';

interface SupplierChartProps {
  suppliers: Supplier[];
  selectedSupplierId: number | null;
  onSupplierSelect: (supplier: Supplier) => void;
  loading?: boolean;
}

const COLORS = ['#4a9eff', '#43b581', '#ffa500', '#9b59b6', '#00d4ff', '#ff6b6b', '#51cf66', '#ffd93d', '#a78bfa', '#fb7185'];

const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: 'var(--secondary-dark)',
        border: '1px solid var(--border-primary)',
        borderRadius: '8px',
        padding: '12px',
        color: '#ffffff'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>
          {data.name}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          Fitness Score: {data.fitness_score.toFixed(3)}
        </div>
      </div>
    );
  }
  return null;
};

export default function SupplierChart({ suppliers, selectedSupplierId, onSupplierSelect, loading = false }: SupplierChartProps) {
  if (loading) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>График рейтинга поставщиков</h3>
          <p className={styles.chartSubtitle}>Fitness Score по поставщикам</p>
        </div>
        <div className={styles.chartContent}>
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>Загрузка данных...</p>
          </div>
        </div>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>График рейтинга поставщиков</h3>
          <p className={styles.chartSubtitle}>Fitness Score по поставщикам</p>
        </div>
        <div className={styles.chartContent}>
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>Нет данных для отображения</p>
            <p className={styles.placeholderSubtext}>Запустите генетический алгоритм для получения данных</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = suppliers.slice(0, 10).map((supplier, index) => ({
    name: supplier.service_name || supplier.name,
    fitness_score: supplier.fitness_score,
    supplier: supplier,
    index: index
  }));

  const handleBarClick = (data: any) => {
    if (data && data.supplier) {
      onSupplierSelect(data.supplier);
    }
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>График рейтинга поставщиков</h3>
        <p className={styles.chartSubtitle}>Fitness Score по поставщикам (топ 10)</p>
      </div>
      <div className={styles.chartContent}>
        <ResponsiveContainer width="100%" height="100%">
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
              content={<CustomTooltip />}
            />
            <Bar 
              dataKey="fitness_score" 
              fill="var(--accent-blue)"
              onClick={handleBarClick}
              cursor="pointer"
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={selectedSupplierId === entry.supplier.id ? COLORS[0] : COLORS[index % COLORS.length]}
                  style={{ 
                    opacity: selectedSupplierId === entry.supplier.id ? 1 : 0.7,
                    transition: 'opacity 0.3s'
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

