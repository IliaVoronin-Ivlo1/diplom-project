'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import reverseGeneticAlgorithmService, { ArticleBrand, Supplier } from '@/services/reverse-genetic-algorithm.service';
import MainHeader from '@/components/MainHeader/MainHeader';
import ArticleBrandList from '@/components/ArticleBrandList/ArticleBrandList';
import ArticleBrandSuppliers from '@/components/ArticleBrandSuppliers/ArticleBrandSuppliers';
import PartsRatingBackground from '@/components/PartsRatingBackground/PartsRatingBackground';
import styles from './parts-rating.module.css';

export default function PartsRatingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [articleBrands, setArticleBrands] = useState<ArticleBrand[]>([]);
  const [selectedArticleBrand, setSelectedArticleBrand] = useState<{ article: string; brand: string } | null>(null);
  const [selectedArticleBrandSuppliers, setSelectedArticleBrandSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const articleBrandListRef = useRef<HTMLDivElement>(null);
  const suppliersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (!authenticated) {
      router.push('/login');
    } else {
      loadReverseGeneticAlgorithmData();
    }
  }, [router]);

  useEffect(() => {
    const syncHeights = () => {
      if (articleBrandListRef.current && suppliersRef.current) {
        const listHeight = articleBrandListRef.current.scrollHeight;
        const suppliersHeight = suppliersRef.current.scrollHeight;
        const minHeight = Math.max(1100, Math.min(listHeight, suppliersHeight));
        
        if (minHeight > 0) {
          articleBrandListRef.current.style.height = `${minHeight}px`;
          suppliersRef.current.style.height = `${minHeight}px`;
        }
      }
    };

    const timeoutId = setTimeout(syncHeights, 100);
    const resizeTimeoutId = setTimeout(syncHeights, 500);
    
    let resizeObserver: ResizeObserver | null = null;
    
    if (articleBrandListRef.current && suppliersRef.current) {
      resizeObserver = new ResizeObserver(() => {
        setTimeout(syncHeights, 50);
      });
      
      resizeObserver.observe(articleBrandListRef.current);
      resizeObserver.observe(suppliersRef.current);
    }
    
    window.addEventListener('resize', syncHeights);
    
    return () => {
      window.removeEventListener('resize', syncHeights);
      clearTimeout(timeoutId);
      clearTimeout(resizeTimeoutId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [articleBrands, selectedArticleBrand, selectedArticleBrandSuppliers, loading, loadingSuppliers]);

  const loadReverseGeneticAlgorithmData = async () => {
    try {
      setLoading(true);
      const data = await reverseGeneticAlgorithmService.getResultsData();
      if (data.results) {
        if (data.results.all_article_brands_ranking) {
          setArticleBrands(data.results.all_article_brands_ranking);
          if (data.results.all_article_brands_ranking.length > 0) {
            const bestArticleBrand = data.results.all_article_brands_ranking[0];
            setSelectedArticleBrand({ article: bestArticleBrand.article, brand: bestArticleBrand.brand });
            await loadArticleBrandSuppliers(bestArticleBrand.article, bestArticleBrand.brand);
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading reverse genetic algorithm data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadArticleBrandSuppliers = async (article: string, brand: string) => {
    try {
      setLoadingSuppliers(true);
      const data = await reverseGeneticAlgorithmService.getArticleBrandSuppliers(article, brand);
      if (data.suppliers) {
        setSelectedArticleBrandSuppliers(data.suppliers);
      } else {
        setSelectedArticleBrandSuppliers([]);
      }
    } catch (err: any) {
      console.error('Error loading article brand suppliers:', err);
      setSelectedArticleBrandSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleArticleBrandSelect = async (articleBrand: ArticleBrand) => {
    setSelectedArticleBrand({ article: articleBrand.article, brand: articleBrand.brand });
    setSelectedArticleBrandSuppliers([]);
    await loadArticleBrandSuppliers(articleBrand.article, articleBrand.brand);
  };

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.container}>
      <PartsRatingBackground />
      <MainHeader />
      <div className={styles.content}>
        <div className={styles.reverseGeneticSection}>
          <div className={styles.articleBrandListWrapper} ref={articleBrandListRef}>
            <ArticleBrandList 
              articleBrands={articleBrands}
              selectedArticleBrand={selectedArticleBrand}
              onArticleBrandSelect={handleArticleBrandSelect}
              loading={loading}
            />
          </div>
          <div className={styles.suppliersWrapper} ref={suppliersRef}>
            {selectedArticleBrand && (
              <ArticleBrandSuppliers
                suppliers={selectedArticleBrandSuppliers}
                articleBrand={selectedArticleBrand}
                loading={loadingSuppliers}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

