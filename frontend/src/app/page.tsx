'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import geneticAlgorithmService, { Supplier } from '@/services/genetic-algorithm.service';
import MainHeader from '@/components/MainHeader/MainHeader';
import ClusteringChart from '@/components/ClusteringChart/ClusteringChart';
import SupplierList from '@/components/SupplierList/SupplierList';
import SupplierChart from '@/components/SupplierChart/SupplierChart';
import SupplierCombinations from '@/components/SupplierCombinations/SupplierCombinations';
import MainBackground from '@/components/MainBackground/MainBackground';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedSupplierCombinations, setSelectedSupplierCombinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCombinations, setLoadingCombinations] = useState(false);

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (!authenticated) {
      router.push('/login');
    } else {
      loadGeneticAlgorithmData();
    }
  }, [router]);

  const loadGeneticAlgorithmData = async () => {
    try {
      setLoading(true);
      const data = await geneticAlgorithmService.getResultsData();
      if (data.results) {
        if (data.results.all_suppliers_ranking) {
          setSuppliers(data.results.all_suppliers_ranking);
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
      <MainBackground />
      <MainHeader />
      <div className={styles.content}>
        <div className={styles.clusteringSection}>
          <ClusteringChart />
        </div>
        <div className={styles.geneticSection}>
          <div className={styles.supplierListWrapper}>
            <SupplierList 
              suppliers={suppliers}
              selectedSupplierId={selectedSupplier?.id || null}
              onSupplierSelect={handleSupplierSelect}
              loading={loading}
            />
          </div>
          <div className={styles.supplierChartWrapper}>
            {selectedSupplier ? (
              <SupplierCombinations
                combinations={selectedSupplierCombinations}
                supplierName={selectedSupplier.service_name || selectedSupplier.name}
                onClose={() => {
                  setSelectedSupplier(null);
                  setSelectedSupplierCombinations([]);
                }}
                loading={loadingCombinations}
              />
            ) : (
              <SupplierChart 
                suppliers={suppliers}
                selectedSupplierId={null}
                onSupplierSelect={handleSupplierSelect}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
