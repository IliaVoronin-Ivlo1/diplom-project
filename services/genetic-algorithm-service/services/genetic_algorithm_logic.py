import logging
import time
import random
import httpx
import json
from datetime import datetime
import psycopg2
import redis
import numpy as np
from deap import base, creator, tools, algorithms

logger = logging.getLogger(__name__)

class GeneticAlgorithmService:
    def __init__(self, redis_client, db_connection, supplier_rating_url):
        self.redis_client = redis_client
        self.db_connection = db_connection
        self.supplier_rating_url = supplier_rating_url
    
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
    
    def _normalize_features(self, suppliers):
        if not suppliers:
            return []
        
        features_matrix = []
        for supplier in suppliers:
            features = [
                supplier['avg_price'],
                supplier['success_rate'],
                supplier['avg_delivery_time'],
                supplier['denial_rate'],
                supplier['orders_count'],
                supplier['total_revenue']
            ]
            features_matrix.append(features)
        
        features_array = np.array(features_matrix)
        
        min_vals = np.min(features_array, axis=0)
        max_vals = np.max(features_array, axis=0)
        
        ranges = max_vals - min_vals
        ranges[ranges == 0] = 1
        
        normalized = (features_array - min_vals) / ranges
        
        for idx, supplier in enumerate(suppliers):
            supplier['normalized_features'] = normalized[idx].tolist()
        
        return suppliers
    
    def _fitness_function(self, individual, suppliers):
        supplier_idx = individual[0]
        if supplier_idx >= len(suppliers):
            return -1000.0,
        
        supplier = suppliers[supplier_idx]
        features = supplier['normalized_features']
        
        price_score = 1.0 - features[0]
        success_score = features[1]
        delivery_score = 1.0 - features[2]
        denial_score = 1.0 - features[3]
        orders_score = features[4]
        revenue_score = features[5]
        
        weights = [0.2, 0.25, 0.15, 0.15, 0.1, 0.15]
        
        fitness = (
            price_score * weights[0] +
            success_score * weights[1] +
            delivery_score * weights[2] +
            denial_score * weights[3] +
            orders_score * weights[4] +
            revenue_score * weights[5]
        )
        
        return fitness,
    
    def _create_individual(self, suppliers):
        return [random.randint(0, len(suppliers) - 1)]
    
    def _mutate_individual(self, individual, suppliers):
        individual[0] = random.randint(0, len(suppliers) - 1)
        return individual,
    
    def _run_genetic_algorithm(self, suppliers):
        if len(suppliers) < 2:
            return suppliers[0] if suppliers else None
        
        creator.create("FitnessMax", base.Fitness, weights=(1.0,))
        creator.create("Individual", list, fitness=creator.FitnessMax)
        
        toolbox = base.Toolbox()
        toolbox.register("individual", tools.initIterate, creator.Individual, 
                         lambda: self._create_individual(suppliers))
        toolbox.register("population", tools.initRepeat, list, toolbox.individual)
        toolbox.register("evaluate", self._fitness_function, suppliers=suppliers)
        toolbox.register("mate", tools.cxOnePoint)
        toolbox.register("mutate", self._mutate_individual, suppliers=suppliers)
        toolbox.register("select", tools.selTournament, tournsize=3)
        
        population = toolbox.population(n=min(50, len(suppliers) * 2))
        
        ngen = 30
        cxpb = 0.5
        mutpb = 0.2
        
        for gen in range(ngen):
            offspring = algorithms.varAnd(population, toolbox, cxpb, mutpb)
            fits = toolbox.map(toolbox.evaluate, offspring)
            for fit, ind in zip(fits, offspring):
                ind.fitness.values = fit
            population = toolbox.select(offspring, len(population))
        
        best_individual = tools.selBest(population, 1)[0]
        best_supplier_idx = best_individual[0]
        
        if best_supplier_idx >= len(suppliers):
            best_supplier_idx = 0
        
        return suppliers[best_supplier_idx]
    
    def _get_supplier_rating(self, supplier_id):
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.post(
                    f"{self.supplier_rating_url}/analyze",
                    json={"supplier_id": supplier_id}
                )
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            logger.error(f'GeneticAlgorithmService[_get_supplier_rating] error: {str(e)}')
        return None
    
    def _save_to_database(self, result_data, metadata):
        query = """
            INSERT INTO genetic_algorithm_results (content, created_at, updated_at)
            VALUES (%s, NOW(), NOW())
            RETURNING id
        """
        
        content = {
            'results': result_data,
            'metadata': metadata
        }
        
        cursor = self.db_connection.cursor()
        cursor.execute(query, (json.dumps(content),))
        result_id = cursor.fetchone()[0]
        self.db_connection.commit()
        cursor.close()
        
        return result_id
    
    def _get_article_brand_data(self, supplier_id):
        query = """
            SELECT 
                order_product.article,
                order_product.brand,
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
                ) as denial_rate
            FROM order_product
            WHERE order_product.distributor_id = %s
            GROUP BY order_product.article, order_product.brand
            HAVING COUNT(order_product.id) > 0
            ORDER BY COUNT(order_product.id) DESC
        """
        
        cursor = self.db_connection.cursor()
        cursor.execute(query, (supplier_id,))
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        cursor.close()
        
        combinations = []
        for row in rows:
            combination = dict(zip(columns, row))
            combinations.append(combination)
        
        return combinations
    
    def _analyze_supplier_combinations(self, supplier, fitness_threshold=0.5):
        article_brand_data = self._get_article_brand_data(supplier['id'])
        
        if len(article_brand_data) == 0:
            return []
        
        if len(article_brand_data) == 1:
            combination = article_brand_data[0]
            return [{
                'article': combination['article'],
                'brand': combination['brand'],
                'fitness_score': 1.0,
                'metrics': {
                    'avg_price': float(combination['avg_price']),
                    'success_rate': float(combination['success_rate']),
                    'avg_delivery_time': float(combination['avg_delivery_time']),
                    'denial_rate': float(combination['denial_rate']),
                    'orders_count': int(combination['orders_count']),
                    'total_revenue': float(combination['total_revenue'])
                }
            }]
        
        normalized_combinations = self._normalize_features(article_brand_data)
        best_combination = self._run_genetic_algorithm(normalized_combinations)
        
        if not best_combination:
            return []
        
        all_ranked = []
        for combination in normalized_combinations:
            fitness = self._fitness_function([normalized_combinations.index(combination)], normalized_combinations)[0]
            all_ranked.append({
                'article': combination['article'],
                'brand': combination['brand'],
                'fitness_score': float(fitness),
                'metrics': {
                    'avg_price': float(combination['avg_price']),
                    'success_rate': float(combination['success_rate']),
                    'avg_delivery_time': float(combination['avg_delivery_time']),
                    'denial_rate': float(combination['denial_rate']),
                    'orders_count': int(combination['orders_count']),
                    'total_revenue': float(combination['total_revenue'])
                }
            })
        
        all_ranked.sort(key=lambda x: x['fitness_score'], reverse=True)
        
        return all_ranked
    
    def find_best_supplier(self, fitness_threshold=0.5):
        start_time = time.time()
        
        try:
            suppliers_data = self._get_suppliers_data()
            
            if len(suppliers_data) == 0:
                return {
                    'success': False,
                    'error': 'Нет поставщиков для анализа',
                    'suppliers_count': 0
                }
            
            if len(suppliers_data) == 1:
                best_supplier = suppliers_data[0]
                rating = self._get_supplier_rating(best_supplier['id'])
                combinations = self._analyze_supplier_combinations(best_supplier, fitness_threshold)
                
                result_data = {
                    'success': True,
                    'best_supplier': {
                        'id': best_supplier['id'],
                        'service_name': best_supplier['service_name'],
                        'name': best_supplier['name'],
                        'fitness_score': 1.0,
                        'metrics': {
                            'avg_price': float(best_supplier['avg_price']),
                            'success_rate': float(best_supplier['success_rate']),
                            'avg_delivery_time': float(best_supplier['avg_delivery_time']),
                            'denial_rate': float(best_supplier['denial_rate']),
                            'orders_count': int(best_supplier['orders_count']),
                            'total_revenue': float(best_supplier['total_revenue'])
                        },
                        'rating': rating,
                        'article_brand_combinations': combinations
                    },
                    'all_suppliers_ranking': [
                        {
                            'id': best_supplier['id'],
                            'service_name': best_supplier['service_name'],
                            'name': best_supplier['name'],
                            'fitness_score': 1.0
                        }
                    ],
                    'execution_time': round(time.time() - start_time, 2)
                }
                
                metadata = {
                    'method': 'genetic_algorithm',
                    'fitness_threshold': fitness_threshold,
                    'timestamp': datetime.utcnow().isoformat() + 'Z',
                    'execution_time': round(time.time() - start_time, 2),
                    'suppliers_count': 1
                }
                
                self._save_to_database(result_data, metadata)
                
                return result_data
            
            normalized_suppliers = self._normalize_features(suppliers_data)
            best_supplier = self._run_genetic_algorithm(normalized_suppliers)
            
            if not best_supplier:
                return {
                    'success': False,
                    'error': 'Ошибка при выполнении генетического алгоритма'
                }
            
            rating = self._get_supplier_rating(best_supplier['id'])
            
            all_ranked = []
            for supplier in normalized_suppliers:
                fitness = self._fitness_function([normalized_suppliers.index(supplier)], normalized_suppliers)[0]
                all_ranked.append({
                    'id': supplier['id'],
                    'service_name': supplier['service_name'],
                    'name': supplier['name'],
                    'fitness_score': float(fitness)
                })
            
            all_ranked.sort(key=lambda x: x['fitness_score'], reverse=True)
            
            filtered_suppliers = [s for s in normalized_suppliers 
                                 if self._fitness_function([normalized_suppliers.index(s)], normalized_suppliers)[0] >= fitness_threshold]
            
            suppliers_with_combinations = []
            all_combinations_global = []
            
            for supplier in filtered_suppliers:
                combinations = self._analyze_supplier_combinations(supplier, fitness_threshold)
                supplier_fitness = self._fitness_function([normalized_suppliers.index(supplier)], normalized_suppliers)[0]
                
                suppliers_with_combinations.append({
                    'id': supplier['id'],
                    'service_name': supplier['service_name'],
                    'name': supplier['name'],
                    'fitness_score': float(supplier_fitness),
                    'metrics': {
                        'avg_price': float(supplier['avg_price']),
                        'success_rate': float(supplier['success_rate']),
                        'avg_delivery_time': float(supplier['avg_delivery_time']),
                        'denial_rate': float(supplier['denial_rate']),
                        'orders_count': int(supplier['orders_count']),
                        'total_revenue': float(supplier['total_revenue'])
                    },
                    'article_brand_combinations': combinations
                })
                
                for combo in combinations:
                    all_combinations_global.append({
                        'supplier_id': supplier['id'],
                        'supplier_name': supplier['service_name'],
                        'article': combo['article'],
                        'brand': combo['brand'],
                        'fitness_score': combo['fitness_score'],
                        'metrics': combo['metrics']
                    })
            
            all_combinations_global.sort(key=lambda x: x['fitness_score'], reverse=True)
            
            best_supplier_fitness = self._fitness_function([normalized_suppliers.index(best_supplier)], normalized_suppliers)[0]
            
            execution_time = round(time.time() - start_time, 2)
            
            result_data = {
                'success': True,
                'best_supplier': {
                    'id': best_supplier['id'],
                    'service_name': best_supplier['service_name'],
                    'name': best_supplier['name'],
                    'fitness_score': float(best_supplier_fitness),
                    'metrics': {
                        'avg_price': float(best_supplier['avg_price']),
                        'success_rate': float(best_supplier['success_rate']),
                        'avg_delivery_time': float(best_supplier['avg_delivery_time']),
                        'denial_rate': float(best_supplier['denial_rate']),
                        'orders_count': int(best_supplier['orders_count']),
                        'total_revenue': float(best_supplier['total_revenue'])
                    },
                    'rating': rating,
                    'article_brand_combinations': self._analyze_supplier_combinations(best_supplier, fitness_threshold)
                },
                'all_suppliers_ranking': all_ranked,
                'suppliers_with_combinations': suppliers_with_combinations,
                'global_article_brand_ranking': all_combinations_global,
                'execution_time': execution_time,
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'fitness_threshold': fitness_threshold
            }
            
            metadata = {
                'method': 'genetic_algorithm',
                'fitness_threshold': fitness_threshold,
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'execution_time': execution_time,
                'suppliers_count': len(suppliers_data),
                'filtered_suppliers_count': len(filtered_suppliers)
            }
            
            self._save_to_database(result_data, metadata)
            
            return result_data
            
        except Exception as e:
            logger.error(f'GeneticAlgorithmService[find_best_supplier] error: {str(e)}')
            return {
                'success': False,
                'error': str(e)
            }

