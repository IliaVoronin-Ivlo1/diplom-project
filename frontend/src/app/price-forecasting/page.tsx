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
  const [forecastingList, setForecastingList] = useState<ArticleBrand[]>([]);
  const [seasonalityList, setSeasonalityList] = useState<ArticleBrand[]>([]);
  const [selectedForecastingItem, setSelectedForecastingItem] = useState<ArticleBrand | null>(null);
  const [selectedSeasonalityItem, setSelectedSeasonalityItem] = useState<ArticleBrand | null>(null);
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
      loadForecastingList();
      loadSeasonalityList();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'forecasting') {
      loadForecastingList();
    } else {
      loadSeasonalityList();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedSeasonalityItem && activeTab === 'seasonality') {
      loadSeasonalityData();
    }
  }, [selectedSeasonalityItem, activeTab]);

  useEffect(() => {
    if (selectedForecastingItem && activeTab === 'forecasting') {
      loadForecastData();
    } else if (activeTab === 'forecasting' && !selectedForecastingItem) {
      setForecastData(null);
    }
  }, [selectedForecastingItem, activeTab]);

  const loadForecastingList = async () => {
    setLoadingList(true);
    try {
      const list = await priceForecastingService.getArticleBrandList('forecasting');
      setForecastingList(list);
      if (list.length > 0) {
        const firstItem = list[0];
        setSelectedForecastingItem(firstItem);
      } else {
        setSelectedForecastingItem(null);
        setForecastData(null);
      }
    } catch (error) {
      console.error('Error loading forecasting list:', error);
      setForecastingList([]);
      setSelectedForecastingItem(null);
      setForecastData(null);
    } finally {
      setLoadingList(false);
    }
  };

  const loadForecastDataForItem = async (item: ArticleBrand) => {
    setLoadingData(true);
    try {
      const data = await priceForecastingService.getForecastData(item.article, item.brand);
      setForecastData(data);
    } catch (error) {
      console.error('Error loading forecast data:', error);
      setForecastData(null);
    } finally {
      setLoadingData(false);
    }
  };

  const loadSeasonalityList = async () => {
    setLoadingList(true);
    try {
      const list = await priceForecastingService.getArticleBrandList('seasonality');
      setSeasonalityList(list);
      if (list.length > 0 && !selectedSeasonalityItem) {
        setSelectedSeasonalityItem(list[0]);
      }
    } catch (error) {
      console.error('Error loading seasonality list:', error);
      setSeasonalityList([]);
    } finally {
      setLoadingList(false);
    }
  };

  const loadSeasonalityData = async () => {
    if (!selectedSeasonalityItem) return;
    setLoadingData(true);
    try {
      const data = await priceForecastingService.getSeasonalityData(selectedSeasonalityItem.article, selectedSeasonalityItem.brand);
      setSeasonalityData(data);
    } catch (error) {
      console.error('Error loading seasonality data:', error);
      setSeasonalityData(null);
    } finally {
      setLoadingData(false);
    }
  };

  const loadForecastData = async () => {
    if (!selectedForecastingItem) return;
    await loadForecastDataForItem(selectedForecastingItem);
  };


  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab);
    setSeasonalityData(null);
    setForecastData(null);
    if (tab === 'forecasting') {
      await loadForecastingList();
    } else {
      await loadSeasonalityList();
    }
  };

  const handleForecastingItemSelect = (item: ArticleBrand) => {
    setSelectedForecastingItem(item);
  };

  const handleSeasonalityItemSelect = (item: ArticleBrand) => {
    setSelectedSeasonalityItem(item);
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
          {activeTab === 'forecasting' ? (
            <>
              <ArticleBrandSidebar
                items={forecastingList}
                selectedItem={selectedForecastingItem}
                onItemSelect={handleForecastingItemSelect}
                loading={loadingList}
              />
              
              <div className={styles.chartContainer}>
                <ForecastChart data={forecastData} loading={loadingData} />
              </div>
            </>
          ) : (
            <>
              <ArticleBrandSidebar
                items={seasonalityList}
                selectedItem={selectedSeasonalityItem}
                onItemSelect={handleSeasonalityItemSelect}
                loading={loadingList}
              />
              
              <div className={styles.chartContainer}>
                <SeasonalityChart data={seasonalityData} loading={loadingData} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
