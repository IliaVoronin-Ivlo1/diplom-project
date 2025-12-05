'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import geneticAlgorithmService, { Supplier } from '@/services/genetic-algorithm.service';
import MainHeader from '@/components/MainHeader/MainHeader';
import SupplierList from '@/components/SupplierList/SupplierList';
import SupplierCombinations from '@/components/SupplierCombinations/SupplierCombinations';
import SuppliersRatingBackground from '@/components/SuppliersRatingBackground/SuppliersRatingBackground';
import styles from './suppliers-rating.module.css';

export default function SuppliersRatingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedSupplierCombinations, setSelectedSupplierCombinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCombinations, setLoadingCombinations] = useState(false);
  const supplierListRef = useRef<HTMLDivElement>(null);
  const supplierChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (!authenticated) {
      router.push('/login');
    } else {
      loadGeneticAlgorithmData();
    }
  }, [router]);

  useEffect(() => {
    const syncHeights = () => {
      if (supplierListRef.current && supplierChartRef.current) {
        const listHeight = supplierListRef.current.scrollHeight;
        const chartHeight = supplierChartRef.current.scrollHeight;
        const minHeight = Math.max(1100, Math.min(listHeight, chartHeight));
        
        if (minHeight > 0) {
          supplierListRef.current.style.height = `${minHeight}px`;
          supplierChartRef.current.style.height = `${minHeight}px`;
        }
      }
    };

    const timeoutId = setTimeout(syncHeights, 100);
    const resizeTimeoutId = setTimeout(syncHeights, 500);
    
    let resizeObserver: ResizeObserver | null = null;
    
    if (supplierListRef.current && supplierChartRef.current) {
      resizeObserver = new ResizeObserver(() => {
        setTimeout(syncHeights, 50);
      });
      
      resizeObserver.observe(supplierListRef.current);
      resizeObserver.observe(supplierChartRef.current);
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
  }, [suppliers, selectedSupplier, selectedSupplierCombinations, loading, loadingCombinations]);

  const loadGeneticAlgorithmData = async () => {
    try {
      setLoading(true);
      const data = await geneticAlgorithmService.getResultsData();
      if (data.results) {
        if (data.results.all_suppliers_ranking) {
          setSuppliers(data.results.all_suppliers_ranking);
          if (data.results.all_suppliers_ranking.length > 0) {
            const bestSupplier = data.results.all_suppliers_ranking[0];
            setSelectedSupplier(bestSupplier);
            await loadSupplierCombinations(bestSupplier.id);
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading genetic algorithm data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierCombinations = async (supplierId: number) => {
    try {
      setLoadingCombinations(true);
      const data = await geneticAlgorithmService.getSupplierCombinations(supplierId);
      if (data.combinations) {
        setSelectedSupplierCombinations(data.combinations);
      } else {
        setSelectedSupplierCombinations([]);
      }
    } catch (err: any) {
      console.error('Error loading supplier combinations:', err);
      setSelectedSupplierCombinations([]);
    } finally {
      setLoadingCombinations(false);
    }
  };

  const handleSupplierSelect = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSelectedSupplierCombinations([]);
    await loadSupplierCombinations(supplier.id);
  };

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.container}>
      <SuppliersRatingBackground />
      <MainHeader />
      <div className={styles.content}>
        <div className={styles.geneticSection}>
          <div className={styles.supplierListWrapper} ref={supplierListRef}>
            <SupplierList 
              suppliers={suppliers}
              selectedSupplierId={selectedSupplier?.id || null}
              onSupplierSelect={handleSupplierSelect}
              loading={loading}
            />
          </div>
          <div className={styles.supplierChartWrapper} ref={supplierChartRef}>
            {selectedSupplier && (
              <SupplierCombinations
                combinations={selectedSupplierCombinations}
                supplierName={selectedSupplier.service_name || selectedSupplier.name}
                loading={loadingCombinations}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

