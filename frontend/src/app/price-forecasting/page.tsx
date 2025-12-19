'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import priceForecastingService, { ArticleBrand, SeasonalityData, ForecastData } from '@/services/price-forecasting.service';
import MainHeader from '@/components/MainHeader/MainHeader';
import MainBackground from '@/components/MainBackground/MainBackground';
import ArticleBrandSidebar from '@/components/ArticleBrandSidebar/ArticleBrandSidebar';
import SeasonalityChart from '@/components/SeasonalityChart/SeasonalityChart';
import ForecastChart from '@/components/ForecastChart/ForecastChart';
import styles from './price-forecasting.module.css';

type TabType = 'forecasting' | 'seasonality';

export default function PriceForecastingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('forecasting');
  const [articleBrandList, setArticleBrandList] = useState<ArticleBrand[]>([]);
  const [selectedItem, setSelectedItem] = useState<ArticleBrand | null>(null);
  const [seasonalityData, setSeasonalityData] = useState<SeasonalityData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (!authenticated) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadArticleBrandList();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedItem && activeTab === 'seasonality') {
      loadSeasonalityData();
    } else if (selectedItem && activeTab === 'forecasting') {
      loadForecastData();
    }
  }, [selectedItem, activeTab]);

  const loadArticleBrandList = async () => {
    setLoadingList(true);
    try {
      await Promise.all([
        priceForecastingService.getArticleBrandList('forecasting'),
        priceForecastingService.getArticleBrandList('seasonality')
      ]);
      
      const list = await priceForecastingService.getArticleBrandList(activeTab);
      setArticleBrandList(list);
      if (list.length > 0 && !selectedItem) {
        setSelectedItem(list[0]);
      }
    } catch (error) {
      console.error('Error loading article brand list:', error);
      setArticleBrandList([]);
    } finally {
      setLoadingList(false);
    }
  };

  const loadSeasonalityData = async () => {
    if (!selectedItem) return;
    setLoadingData(true);
    try {
      const data = await priceForecastingService.getSeasonalityData(selectedItem.article, selectedItem.brand);
      setSeasonalityData(data);
    } catch (error) {
      console.error('Error loading seasonality data:', error);
      setSeasonalityData(null);
    } finally {
      setLoadingData(false);
    }
  };

  const loadForecastData = async () => {
    if (!selectedItem) return;
    setLoadingData(true);
    try {
      const data = await priceForecastingService.getForecastData(selectedItem.article, selectedItem.brand);
      setForecastData(data);
    } catch (error) {
      console.error('Error loading forecast data:', error);
      setForecastData(null);
    } finally {
      setLoadingData(false);
    }
  };

  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab);
    
    const forecastingList = await priceForecastingService.getArticleBrandList('forecasting');
    const seasonalityList = await priceForecastingService.getArticleBrandList('seasonality');
    
    const list = tab === 'forecasting' ? forecastingList : seasonalityList;
    setArticleBrandList(list);
    
    if (list.length > 0) {
      const currentItem = list.find(item => 
        selectedItem && item.article === selectedItem.article && item.brand === selectedItem.brand
      );
      const newSelectedItem = currentItem || list[0];
      setSelectedItem(newSelectedItem);
    } else {
      setSelectedItem(null);
      setSeasonalityData(null);
      setForecastData(null);
    }
  };

  const handleItemSelect = (item: ArticleBrand) => {
    setSelectedItem(item);
  };

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.container}>
      <MainBackground />
      <MainHeader />
      <div className={styles.content}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'forecasting' ? styles.active : ''}`}
            onClick={() => handleTabChange('forecasting')}
          >
            Прогнозирование
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'seasonality' ? styles.active : ''}`}
            onClick={() => handleTabChange('seasonality')}
          >
            Сезонность
          </button>
        </div>

        <div className={styles.mainContent}>
          <ArticleBrandSidebar
            items={articleBrandList}
            selectedItem={selectedItem}
            onItemSelect={handleItemSelect}
            loading={loadingList}
          />
          
          <div className={styles.chartContainer}>
            {activeTab === 'seasonality' ? (
              <SeasonalityChart data={seasonalityData} loading={loadingData} />
            ) : (
              <ForecastChart data={forecastData} loading={loadingData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
