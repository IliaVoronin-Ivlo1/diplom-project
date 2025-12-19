<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SupplierOrdersStatisticsController extends Controller
{
    public function getSupplierOrdersStatistics(Request $request)
    {
        try {
            $limit = (int) $request->get('limit', 10);
            
            $statistics = DB::table('order_product')
                ->join('product_distributor', 'order_product.distributor_id', '=', 'product_distributor.id')
                ->select(
                    DB::raw("COALESCE(MAX(product_distributor.remote_params->>'service'), MIN(product_distributor.name)) as supplier_name"),
                    DB::raw('COUNT(order_product.id) as total_orders'),
                    DB::raw('COALESCE(SUM(CASE WHEN order_product.is_denied = 0 AND order_product.is_archived = 0 THEN 1 ELSE 0 END), 0) as successful_orders'),
                    DB::raw('COALESCE(SUM(CASE WHEN order_product.is_denied = 1 OR order_product.is_archived = 1 THEN 1 ELSE 0 END), 0) as failed_orders')
                )
                ->groupBy(DB::raw("COALESCE(product_distributor.remote_params->>'service', product_distributor.name)"))
                ->orderByDesc(DB::raw('COUNT(order_product.id)'))
                ->limit($limit)
                ->get();

            $result = $statistics->map(function ($item) {
                return [
                    'supplier_name' => $item->supplier_name ?? 'Неизвестный поставщик',
                    'total_orders' => (int) ($item->total_orders ?? 0),
                    'successful_orders' => (int) ($item->successful_orders ?? 0),
                    'failed_orders' => (int) ($item->failed_orders ?? 0)
                ];
            })->toArray();

            Log::info("SupplierOrdersStatisticsController[getSupplierOrdersStatistics]", [
                'count' => count($result),
                'data' => $result
            ]);

            return response()->json([
                'statistics' => $result
            ]);
        } catch (\Exception $e) {
            Log::info("SupplierOrdersStatisticsController[getSupplierOrdersStatistics]", [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'statistics' => []
            ], 500);
        }
    }
}

