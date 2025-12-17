<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Services\ClusterService\Contract\ClusterServiceInterface;
use App\Http\Services\ClusterService\Exceptions\ClusterServiceException;

class ClusterController extends Controller
{
    private ClusterServiceInterface $clusterService;

    public function __construct(ClusterServiceInterface $clusterService)
    {
        $this->clusterService = $clusterService;
    }

    public function getClustersData(Request $request)
    {
        try {
            $result = $this->clusterService->getClustersData();
            return response()->json($result);
        } catch (ClusterServiceException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            return response()->json([
                "success" => false,
                "message" => "Ошибка при получении данных кластеризации"
            ], 500);
        }
    }
}
