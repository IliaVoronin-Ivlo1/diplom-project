import logging
import json
import time
from datetime import datetime, timedelta
import psycopg2
import redis
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

logger = logging.getLogger(__name__)

class ClusteringService:
    def __init__(self, redis_client, db_connection):
        self.redis_client = redis_client
        self.db_connection = db_connection
    
    def _get_suppliers_data(self):
        query = """
            SELECT 
                COALESCE(MAX(product_distributor.remote_params->>'service'), MIN(product_distributor.name)) as service_id,
                COALESCE(MAX(product_distributor.remote_params->>'service'), MIN(product_distributor.name)) as service_name,
                MIN(product_distributor.id) as id,
                STRING_AGG(DISTINCT product_distributor.name, ', ' ORDER BY product_distributor.name) as name,
                COUNT(order_product.id) as orders_count,
                COALESCE(SUM(order_product.total), 0) as total_revenue,
                COALESCE(AVG(order_product.price), 0) as avg_price,
                COALESCE(
                    SUM(CASE WHEN order_product.is_denied = 0 AND order_product.is_archived = 0 THEN 1 ELSE 0 END)::float / 
                    NULLIF(COUNT(order_product.id), 0) * 100, 
                    0
                ) as success_rate,
                COALESCE(AVG(order_product.deliverytime_max), 0) as avg_delivery_time,
                COALESCE(
                    SUM(CASE WHEN order_product.is_denied = 1 THEN 1 ELSE 0 END)::float / 
                    NULLIF(COUNT(order_product.id), 0) * 100, 
                    0
                ) as denial_rate,
                COUNT(DISTINCT order_product.brand) as unique_brands,
                COUNT(DISTINCT order_product.article) as unique_parts
            FROM product_distributor
            LEFT JOIN order_product ON product_distributor.id = order_product.distributor_id
            GROUP BY COALESCE(product_distributor.remote_params->>'service', product_distributor.name)
            HAVING COUNT(order_product.id) > 0
            ORDER BY MIN(product_distributor.id)
        """
        
        cursor = self.db_connection.cursor()
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        cursor.close()
        
        suppliers = []
        for row in rows:
            supplier = dict(zip(columns, row))
            suppliers.append(supplier)
        
        return suppliers
    
    def _prepare_features(self, suppliers):
        features = []
        supplier_ids = []
        
        for supplier in suppliers:
            features.append([
                supplier['orders_count'],
                supplier['total_revenue'],
                supplier['avg_price'],
                supplier['success_rate'],
                supplier['avg_delivery_time'],
                supplier['denial_rate'],
                supplier['unique_brands'],
                supplier['unique_parts']
            ])
            supplier_ids.append(supplier['service_id'])
        
        return np.array(features), supplier_ids
    
    def _find_optimal_clusters(self, features_scaled, max_clusters):
        if max_clusters < 2:
            return 2
        
        if max_clusters == 2:
            return 2
        
        inertias = []
        k_range = range(2, min(max_clusters + 1, len(features_scaled) + 1))
        
        for k in k_range:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            kmeans.fit(features_scaled)
            inertias.append(kmeans.inertia_)
        
        if len(inertias) < 2:
            return 2
        
        inertias = np.array(inertias)
        k_values = np.array(list(k_range))
        
        if len(inertias) >= 3:
            rate_of_change = np.diff(inertias)
            second_derivative = np.diff(rate_of_change)
            
            if len(second_derivative) > 0:
                elbow_idx = np.argmax(second_derivative) + 1
                optimal_k = k_values[elbow_idx]
            else:
                optimal_k = k_values[np.argmax(rate_of_change) + 1] if len(rate_of_change) > 0 else 2
        else:
            optimal_k = 2
        
        optimal_k = max(2, min(optimal_k, max_clusters))
        return int(optimal_k)
    
    def _perform_clustering(self, features, supplier_ids, suppliers_data):
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        
        max_clusters = len(features)
        optimal_k = self._find_optimal_clusters(features_scaled, max_clusters)
        
        kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(features_scaled)
        
        pca = PCA(n_components=2)
        features_2d = pca.fit_transform(features_scaled)
        
        clusters = {}
        for idx, service_id in enumerate(supplier_ids):
            cluster_id = int(cluster_labels[idx]) + 1
            if cluster_id not in clusters:
                clusters[cluster_id] = {
                    'id': cluster_id,
                    'suppliers': [],
                    'coordinates': []
                }
            
            supplier_info = next((s for s in suppliers_data if s['service_id'] == service_id), None)
            if supplier_info:
                clusters[cluster_id]['suppliers'].append({
                    'id': supplier_info['id'],
                    'name': supplier_info['service_name'],
                    'x': float(features_2d[idx][0]),
                    'y': float(features_2d[idx][1])
                })
                clusters[cluster_id]['coordinates'].append([
                    float(features_2d[idx][0]),
                    float(features_2d[idx][1])
                ])
        
        cluster_list = []
        for cluster_id, cluster_data in clusters.items():
            cluster_list.append({
                'id': cluster_id,
                'suppliers': cluster_data['suppliers'],
                'count': len(cluster_data['suppliers'])
            })
        
        return cluster_list, optimal_k
    
    def _save_to_database(self, clusters_data, metadata):
        query = """
            INSERT INTO supplier_clusters (content, created_at, updated_at)
            VALUES (%s, NOW(), NOW())
            RETURNING id
        """
        
        content = {
            'clusters': clusters_data,
            'metadata': metadata
        }
        
        cursor = self.db_connection.cursor()
        cursor.execute(query, (json.dumps(content),))
        cluster_id = cursor.fetchone()[0]
        self.db_connection.commit()
        cursor.close()
        
        return cluster_id
    
    def cluster_suppliers(self):
        start_time = time.time()
        
        try:
            suppliers_data = self._get_suppliers_data()
            
            if len(suppliers_data) < 2:
                return {
                    'error': 'Недостаточно поставщиков для кластеризации',
                    'suppliers_count': len(suppliers_data)
                }
            
            features, supplier_ids = self._prepare_features(suppliers_data)
            
            clusters, optimal_k = self._perform_clustering(features, supplier_ids, suppliers_data)
            
            execution_time = round(time.time() - start_time, 2)
            
            metadata = {
                'method': 'kmeans',
                'n_clusters': optimal_k,
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'execution_time': execution_time,
                'suppliers_count': len(suppliers_data)
            }
            
            cluster_id = self._save_to_database(clusters, metadata)
            
            return {
                'success': True,
                'cluster_id': cluster_id,
                'clusters': clusters,
                'metadata': metadata
            }
            
        except Exception as e:
            logger.error(f'ClusteringService[cluster_suppliers] error: {str(e)}')
            return {
                'success': False,
                'error': str(e)
            }
