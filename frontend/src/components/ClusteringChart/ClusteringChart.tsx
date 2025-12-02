'use client';

import { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, TooltipProps } from 'recharts';
import clusterService from '@/services/cluster.service';
import styles from './ClusteringChart.module.css';

interface Supplier {
  id: number;
  name: string;
  x: number;
  y: number;
}

interface Cluster {
  id: number;
  count: number;
  suppliers: Supplier[];
}

const COLORS = ['#4a9eff', '#f04747', '#43b581', '#ffa500', '#9b59b6', '#00d4ff', '#ff6b6b', '#51cf66', '#ffd93d', '#a78bfa', '#fb7185', '#38bdf8'];

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
          Кластер {data.clusterId}
        </div>
      </div>
    );
  }
  return null;
};

export default function ClusteringChart() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClustersData();
  }, []);

  const loadClustersData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clusterService.getClustersData();
      setClusters(data.clusters || []);
    } catch (err: any) {
      setError('Ошибка при загрузке данных кластеризации');
      console.error('Error loading clusters:', err);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    const chartData: Array<{ x: number; y: number; name: string; clusterId: number }> = [];
    
    clusters.forEach((cluster) => {
      cluster.suppliers.forEach((supplier) => {
        chartData.push({
          x: supplier.x,
          y: supplier.y,
          name: supplier.name,
          clusterId: cluster.id
        });
      });
    });
    
    return chartData;
  };

  if (loading) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartContent}>
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>Загрузка данных...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartContent}>
          <div className={styles.placeholder}>
            <p className={styles.placeholderText} style={{ color: 'var(--error-red)' }}>{error}</p>
            <button onClick={loadClustersData} className={styles.retryButton}>
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (clusters.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartContent}>
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>Нет данных для отображения</p>
            <p className={styles.placeholderSubtext}>Запустите кластеризацию для получения данных</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Карта кластеров поставщиков</h3>
        <p className={styles.chartSubtitle}>Визуализация кластеризации поставщиков</p>
      </div>
      <div className={styles.chartContent}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" opacity={0.3} />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="X"
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)' }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Y"
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)' }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={<CustomTooltip />}
            />
            <Scatter name="Поставщики" data={chartData} fill="var(--accent-blue)">
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.clusterId % COLORS.length]} 
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.chartLegend}>
        {clusters.map((cluster) => (
          <div key={cluster.id} className={styles.legendItem}>
            <div 
              className={styles.legendColor} 
              style={{ backgroundColor: COLORS[cluster.id % COLORS.length] }}
            ></div>
            <span className={styles.legendText}>
              Кластер {cluster.id} ({cluster.count} поставщиков)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
