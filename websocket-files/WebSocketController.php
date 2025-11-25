<?php

namespace App\Http\Controllers;

use App\Services\WebSocketService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WebSocketController extends Controller
{
    protected $webSocketService;

    public function __construct(WebSocketService $webSocketService)
    {
        $this->webSocketService = $webSocketService;
    }

    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event' => 'required|string',
            'data' => 'required|array',
            'channel' => 'nullable|string'
        ]);

        $result = $this->webSocketService->send(
            $validated['event'],
            $validated['data'],
            $validated['channel'] ?? null
        );

        return response()->json([
            'success' => $result,
            'message' => $result ? 'Сообщение отправлено' : 'Ошибка отправки'
        ]);
    }

    public function broadcast(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event' => 'required|string',
            'data' => 'required|array',
            'channels' => 'nullable|array'
        ]);

        $result = $this->webSocketService->broadcast(
            $validated['event'],
            $validated['data'],
            $validated['channels'] ?? []
        );

        return response()->json([
            'success' => $result,
            'message' => $result ? 'Широковещательное сообщение отправлено' : 'Ошибка отправки'
        ]);
    }

    public function sendToUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'event' => 'required|string',
            'data' => 'required|array'
        ]);

        $result = $this->webSocketService->sendToUser(
            $validated['user_id'],
            $validated['event'],
            $validated['data']
        );

        return response()->json([
            'success' => $result,
            'message' => $result ? 'Сообщение отправлено пользователю' : 'Ошибка отправки'
        ]);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'active_connections' => $this->webSocketService->getActiveConnections(),
            'timestamp' => now()->timestamp
        ]);
    }

    public function checkUserOnline(int $userId): JsonResponse
    {
        $isOnline = $this->webSocketService->isUserOnline($userId);

        return response()->json([
            'user_id' => $userId,
            'is_online' => $isOnline
        ]);
    }
}

