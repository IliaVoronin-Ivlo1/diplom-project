import logging
import time
import random
import json
from datetime import datetime
import numpy as np
from deap import base, creator, tools, algorithms
from .database import get_db_cursor
from .connections import get_redis_client

logger = logging.getLogger(__name__)

class ReverseGeneticAlgorithmService:
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
    
    def _get_all_article_brand_combinations(self):
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
            GROUP BY order_product.article, order_product.brand
            HAVING COUNT(order_product.id) >= 300
            ORDER BY COUNT(order_product.id) DESC
        """
        
        with get_db_cursor() as cursor:
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
        
        combinations = []
        for row in rows:
            combination = dict(zip(columns, row))
            combination['orders_count'] = int(combination['orders_count'])
            combination['total_revenue'] = float(combination['total_revenue'])
            combination['avg_price'] = float(combination['avg_price'])
            combination['success_rate'] = float(combination['success_rate'])
            combination['avg_delivery_time'] = float(combination['avg_delivery_time'])
            combination['denial_rate'] = float(combination['denial_rate'])
            combinations.append(combination)
        
        return combinations
    
    def _normalize_features(self, items):
        if not items:
            return []
        
        features_matrix = []
        for item in items:
            features = [
                item['avg_price'],
                item['success_rate'],
                item['avg_delivery_time'],
                item['denial_rate'],
                item['orders_count'],
                item['total_revenue']
            ]
            features_matrix.append(features)
        
        features_array = np.array(features_matrix)
        
        min_vals = np.min(features_array, axis=0)
        max_vals = np.max(features_array, axis=0)
        
        ranges = max_vals - min_vals
        ranges[ranges == 0] = 1
        
        normalized = (features_array - min_vals) / ranges
        
        for idx, item in enumerate(items):
            item['normalized_features'] = normalized[idx].tolist()
        
        return items
    
    def _fitness_function(self, individual, items):
        if len(items) == 0:
            return -1000.0,
        
        weights = individual[:6]
        
        for i in range(len(weights)):
            weights[i] = max(0.0, weights[i])
        
        total_weight = sum(weights)
        if total_weight == 0:
            weights = [1.0/6] * 6
        else:
            weights = [w / total_weight for w in weights]
        
        best_fitness = -float('inf')
        
        for item in items:
            features = item['normalized_features']
            
            price_score = 1.0 - features[0]
            success_score = features[1]
            delivery_score = 1.0 - features[2]
            denial_score = 1.0 - features[3]
            orders_score = features[4]
            revenue_score = features[5]
            
            fitness = (
                price_score * weights[0] +
                success_score * weights[1] +
                delivery_score * weights[2] +
                denial_score * weights[3] +
                orders_score * weights[4] +
                revenue_score * weights[5]
            )
            
            if fitness > best_fitness:
                best_fitness = fitness
        
        return best_fitness,
    
    def _create_individual(self, items):
        weights = [random.uniform(0.0, 1.0) for _ in range(6)]
        total = sum(weights)
        if total > 0:
            weights = [w / total for w in weights]
        else:
            weights = [1.0/6] * 6
        return weights
    
    def _mutate_individual(self, individual, items):
        mutation_strength = 0.1
        for i in range(len(individual)):
            if random.random() < 0.3:
                new_value = individual[i] + random.gauss(0, mutation_strength)
                individual[i] = max(0.0, min(1.0, new_value))
        
        for i in range(len(individual)):
            individual[i] = max(0.0, individual[i])
        
        total = sum(individual)
        if total > 0:
            for i in range(len(individual)):
                individual[i] = individual[i] / total
        else:
            individual[:] = [1.0/6] * 6
        
        return individual,
    
    def _run_genetic_algorithm(self, items):
        if len(items) == 0:
            return None, [1.0/6] * 6
        if len(items) == 1:
            return items[0], [1.0/6] * 6
        
        if not hasattr(creator, "FitnessMax"):
            creator.create("FitnessMax", base.Fitness, weights=(1.0,))
        
        if not hasattr(creator, "Individual"):
            creator.create("Individual", list, fitness=creator.FitnessMax)
        
        toolbox = base.Toolbox()
        toolbox.register("individual", tools.initIterate, creator.Individual, 
                         lambda: self._create_individual(items))
        toolbox.register("population", tools.initRepeat, list, toolbox.individual)
        toolbox.register("evaluate", self._fitness_function, items=items)
        toolbox.register("mate", tools.cxBlend, alpha=0.5)
        toolbox.register("mutate", self._mutate_individual, items=items)
        tournsize = min(3, len(items))
        if tournsize < 1:
            tournsize = 1
        toolbox.register("select", tools.selTournament, tournsize=tournsize)
        
        population_size = min(50, max(2, len(items) * 2))
        population = toolbox.population(n=population_size)
        
        ngen = 30
        cxpb = 0.5
        mutpb = 0.2
        
        for gen in range(ngen):
            try:
                offspring = algorithms.varAnd(population, toolbox, cxpb, mutpb)
                fits = toolbox.map(toolbox.evaluate, offspring)
                for fit, ind in zip(fits, offspring):
                    ind.fitness.values = fit
                
                if len(offspring) == 0:
                    break
                
                if len(offspring) == 1:
                    population = offspring
                    continue
                
                if len(offspring) == 2:
                    population = offspring
                    continue
                
                actual_tournsize = min(tournsize, len(offspring) - 1)
                if actual_tournsize < 1:
                    actual_tournsize = 1
                
                if actual_tournsize >= len(offspring):
                    actual_tournsize = len(offspring) - 1
                    if actual_tournsize < 1:
                        actual_tournsize = 1
                
                if actual_tournsize != tournsize:
                    toolbox.register("select", tools.selTournament, tournsize=actual_tournsize)
                
                select_count = min(len(population), len(offspring))
                if select_count > 0:
                    population = toolbox.select(offspring, select_count)
                else:
                    population = offspring
            except Exception as e:
                logger.error(f'ReverseGeneticAlgorithmService[_run_genetic_algorithm] generation {gen} error: {str(e)}')
                break
        
        best_individual = tools.selBest(population, 1)[0]
        best_weights = best_individual[:6]
        
        for i in range(len(best_weights)):
            best_weights[i] = max(0.0, best_weights[i])
        
        total_weight = sum(best_weights)
        if total_weight > 0:
            best_weights = [w / total_weight for w in best_weights]
        else:
            best_weights = [1.0/6] * 6
        
        best_item = None
        best_fitness = -float('inf')
        
        for item in items:
            fitness = self._calculate_fitness_with_weights(item, best_weights)
            
            if fitness > best_fitness:
                best_fitness = fitness
                best_item = item
        
        return best_item if best_item else items[0], best_weights
    
    def _calculate_fitness_with_weights(self, item, weights):
        features = item['normalized_features']
        
        price_score = 1.0 - features[0]
        success_score = features[1]
        delivery_score = 1.0 - features[2]
        denial_score = 1.0 - features[3]
        orders_score = features[4]
        revenue_score = features[5]
        
        fitness = (
            price_score * weights[0] +
            success_score * weights[1] +
            delivery_score * weights[2] +
            denial_score * weights[3] +
            orders_score * weights[4] +
            revenue_score * weights[5]
        )
        
        return fitness
    
    def _get_suppliers_for_article_brand(self, article, brand):
        query = """
            SELECT 
                COALESCE(MAX(product_distributor.remote_params->>'service'), MIN(product_distributor.name)) as service_name,
                MIN(product_distributor.id) as supplier_id,
                STRING_AGG(DISTINCT product_distributor.name, ', ' ORDER BY product_distributor.name) as supplier_name,
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
            JOIN product_distributor ON order_product.distributor_id = product_distributor.id
            WHERE order_product.article = %s AND order_product.brand = %s
            GROUP BY COALESCE(product_distributor.remote_params->>'service', product_distributor.name)
            HAVING COUNT(order_product.id) > 0
            ORDER BY MIN(product_distributor.id)
        """
        
        with get_db_cursor() as cursor:
            cursor.execute(query, (article, brand))
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
        
        suppliers = []
        for row in rows:
            supplier = dict(zip(columns, row))
            supplier['supplier_id'] = int(supplier['supplier_id'])
            supplier['orders_count'] = int(supplier['orders_count'])
            supplier['total_revenue'] = float(supplier['total_revenue'])
            supplier['avg_price'] = float(supplier['avg_price'])
            supplier['success_rate'] = float(supplier['success_rate'])
            supplier['avg_delivery_time'] = float(supplier['avg_delivery_time'])
            supplier['denial_rate'] = float(supplier['denial_rate'])
            suppliers.append(supplier)
        
        return suppliers
    
    def _analyze_suppliers_for_article_brand(self, article, brand):
        suppliers_data = self._get_suppliers_for_article_brand(article, brand)
        
        logger.info(f'ReverseGeneticAlgorithmService[_analyze_suppliers_for_article_brand] article={article}, brand={brand}, suppliers_count={len(suppliers_data)}')
        
        if len(suppliers_data) == 0:
            return []
        
        if len(suppliers_data) == 1:
            supplier = suppliers_data[0]
            return [{
                'supplier_id': supplier['supplier_id'],
                'service_name': supplier['service_name'],
                'supplier_name': supplier['supplier_name'],
                'fitness_score': 1.0,
                'metrics': {
                    'avg_price': float(supplier['avg_price']),
                    'success_rate': float(supplier['success_rate']),
                    'avg_delivery_time': float(supplier['avg_delivery_time']),
                    'denial_rate': float(supplier['denial_rate']),
                    'orders_count': int(supplier['orders_count']),
                    'total_revenue': float(supplier['total_revenue'])
                }
            }]
        
        if len(suppliers_data) == 2:
            normalized_suppliers = self._normalize_features(suppliers_data)
            default_weights = [0.2, 0.25, 0.15, 0.15, 0.1, 0.15]
            all_ranked = []
            for supplier in normalized_suppliers:
                fitness = self._calculate_fitness_with_weights(supplier, default_weights)
                all_ranked.append({
                    'supplier_id': supplier['supplier_id'],
                    'service_name': supplier['service_name'],
                    'supplier_name': supplier['supplier_name'],
                    'fitness_score': float(fitness),
                    'metrics': {
                        'avg_price': float(supplier['avg_price']),
                        'success_rate': float(supplier['success_rate']),
                        'avg_delivery_time': float(supplier['avg_delivery_time']),
                        'denial_rate': float(supplier['denial_rate']),
                        'orders_count': int(supplier['orders_count']),
                        'total_revenue': float(supplier['total_revenue'])
                    }
                })
            all_ranked.sort(key=lambda x: x['fitness_score'], reverse=True)
            return all_ranked
        
        normalized_suppliers = self._normalize_features(suppliers_data)
        best_supplier, optimal_weights = self._run_genetic_algorithm(normalized_suppliers)
        
        if not best_supplier:
            return []
        
        all_ranked = []
        for supplier in normalized_suppliers:
            fitness = self._calculate_fitness_with_weights(supplier, optimal_weights)
            all_ranked.append({
                'supplier_id': supplier['supplier_id'],
                'service_name': supplier['service_name'],
                'supplier_name': supplier['supplier_name'],
                'fitness_score': float(fitness),
                'metrics': {
                    'avg_price': float(supplier['avg_price']),
                    'success_rate': float(supplier['success_rate']),
                    'avg_delivery_time': float(supplier['avg_delivery_time']),
                    'denial_rate': float(supplier['denial_rate']),
                    'orders_count': int(supplier['orders_count']),
                    'total_revenue': float(supplier['total_revenue'])
                }
            })
        
        all_ranked.sort(key=lambda x: x['fitness_score'], reverse=True)
        
        return all_ranked
    
    def find_best_article_brands(self, history_id=None):
        start_time = time.time()
        
        try:
            all_combinations = self._get_all_article_brand_combinations()
            
            if len(all_combinations) == 0:
                return {
                    'success': False,
                    'error': 'Нет автозапчастей для анализа',
                    'combinations_count': 0
                }
            
            if len(all_combinations) == 1:
                combination = all_combinations[0]
                suppliers = self._analyze_suppliers_for_article_brand(combination['article'], combination['brand'])
                
                result_data = {
                    'success': True,
                    'best_article_brand': {
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
                        },
                        'suppliers_ranking': suppliers
                    },
                    'all_article_brands_ranking': [
                        {
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
                        }
                    ],
                    'execution_time': round(time.time() - start_time, 2)
                }
                
                self._save_to_database(result_data, history_id)
                
                return result_data
            
            normalized_combinations = self._normalize_features(all_combinations)
            best_combination, optimal_weights = self._run_genetic_algorithm(normalized_combinations)
            
            if not best_combination:
                return {
                    'success': False,
                    'error': 'Ошибка при выполнении генетического алгоритма'
                }
            
            all_ranked = []
            for combination in normalized_combinations:
                fitness = self._calculate_fitness_with_weights(combination, optimal_weights)
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
            
            logger.info(f'ReverseGeneticAlgorithmService[find_best_article_brands] Starting processing of {len(all_ranked)} combinations')
            
            article_brands_with_suppliers = []
            
            for idx, combination in enumerate(all_ranked, 1):
                if idx % 1000 == 0 or idx == 1:
                    logger.info(f'ReverseGeneticAlgorithmService[find_best_article_brands] Processing combination {idx}/{len(all_ranked)}')
                
                suppliers = self._analyze_suppliers_for_article_brand(combination['article'], combination['brand'])
                
                article_brands_with_suppliers.append({
                    'article': combination['article'],
                    'brand': combination['brand'],
                    'fitness_score': combination['fitness_score'],
                    'metrics': combination['metrics'],
                    'suppliers_ranking': suppliers
                })
            
            best_combination_suppliers = self._analyze_suppliers_for_article_brand(
                best_combination['article'], 
                best_combination['brand']
            )
            
            execution_time = round(time.time() - start_time, 2)
            
            best_combination_fitness = self._calculate_fitness_with_weights(best_combination, optimal_weights)
            
            result_data = {
                'success': True,
                'best_article_brand': {
                    'article': best_combination['article'],
                    'brand': best_combination['brand'],
                    'fitness_score': float(best_combination_fitness),
                    'metrics': {
                        'avg_price': float(best_combination['avg_price']),
                        'success_rate': float(best_combination['success_rate']),
                        'avg_delivery_time': float(best_combination['avg_delivery_time']),
                        'denial_rate': float(best_combination['denial_rate']),
                        'orders_count': int(best_combination['orders_count']),
                        'total_revenue': float(best_combination['total_revenue'])
                    },
                    'suppliers_ranking': best_combination_suppliers
                },
                'all_article_brands_ranking': all_ranked,
                'article_brands_with_suppliers': article_brands_with_suppliers,
                'execution_time': execution_time,
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'combinations_count': len(all_combinations)
            }
            
            self._save_to_database(result_data, history_id)
            
            return result_data
            
        except Exception as e:
            logger.error(f'ReverseGeneticAlgorithmService[find_best_article_brands] error: {str(e)}')
            return {
                'success': False,
                'error': str(e)
            }
    
    def _save_to_database(self, result_data, history_id=None):
        if not result_data.get('success'):
            return
        
        with get_db_cursor() as cursor:
            if history_id:
                run_query = """
                    INSERT INTO reverse_genetic_algorithm_runs (history_id, execution_time, combinations_count, created_at, updated_at)
                    VALUES (%s, %s, %s, NOW(), NOW())
                    RETURNING id
                """
                cursor.execute(run_query, (
                    history_id,
                    result_data.get('execution_time', 0),
                    result_data.get('combinations_count', 0)
                ))
            else:
                run_query = """
                    INSERT INTO reverse_genetic_algorithm_runs (execution_time, combinations_count, created_at, updated_at)
                    VALUES (%s, %s, NOW(), NOW())
                    RETURNING id
                """
                cursor.execute(run_query, (
                    result_data.get('execution_time', 0),
                    result_data.get('combinations_count', 0)
                ))
            
            run_id = cursor.fetchone()[0]
            
            all_ranked = result_data.get('all_article_brands_ranking', [])
            article_brands_with_suppliers = result_data.get('article_brands_with_suppliers', [])
            
            article_brand_ranking_ids = {}
            
            for rank, combination in enumerate(all_ranked, 1):
                article_brand_query = """
                    INSERT INTO reverse_genetic_algorithm_article_brand_rankings 
                    (run_id, article, brand, fitness_score, rank, avg_price, success_rate, avg_delivery_time, 
                     denial_rate, orders_count, total_revenue, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                    RETURNING id
                """
                
                metrics = combination.get('metrics', {})
                cursor.execute(article_brand_query, (
                    run_id,
                    combination['article'],
                    combination['brand'],
                    combination['fitness_score'],
                    rank,
                    metrics.get('avg_price', 0),
                    metrics.get('success_rate', 0),
                    metrics.get('avg_delivery_time', 0),
                    metrics.get('denial_rate', 0),
                    metrics.get('orders_count', 0),
                    metrics.get('total_revenue', 0)
                ))
                article_brand_id = cursor.fetchone()[0]
                article_brand_ranking_ids[(combination['article'], combination['brand'])] = article_brand_id
            
            for item in article_brands_with_suppliers:
                article = item['article']
                brand = item['brand']
                article_brand_id = article_brand_ranking_ids.get((article, brand))
                
                if not article_brand_id:
                    continue
                
                suppliers = item.get('suppliers_ranking', [])
                
                for supplier_rank, supplier in enumerate(suppliers, 1):
                    supplier_query = """
                        INSERT INTO reverse_genetic_algorithm_supplier_rankings 
                        (article_brand_ranking_id, supplier_id, service_name, supplier_name, fitness_score, rank,
                         avg_price, success_rate, avg_delivery_time, denial_rate, orders_count, total_revenue,
                         created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                    """
                    
                    supplier_metrics = supplier.get('metrics', {})
                    cursor.execute(supplier_query, (
                        article_brand_id,
                        supplier.get('supplier_id', 0),
                        supplier.get('service_name', ''),
                        supplier.get('supplier_name', ''),
                        supplier.get('fitness_score', 0),
                        supplier_rank,
                        supplier_metrics.get('avg_price', 0),
                        supplier_metrics.get('success_rate', 0),
                        supplier_metrics.get('avg_delivery_time', 0),
                        supplier_metrics.get('denial_rate', 0),
                        supplier_metrics.get('orders_count', 0),
                        supplier_metrics.get('total_revenue', 0)
                    ))

