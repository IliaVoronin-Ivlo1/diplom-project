<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

class WebSocketService
{
    protected $redis;
    protected $channel;

    public function __construct()
    {
        $this->redis = Redis::connection();
        $this->channel = config('broadcasting.connections.redis.options.prefix', 'laravel_database_') . 'websocket';
    }

    public function send(string $event, array $data, ?string $channel = null): bool
    {
        try {
            $message = [
                'event' => $event,
                'data' => $data,
                'timestamp' => now()->timestamp
            ];

            $channelName = $channel ?? $this->channel;
            
            $this->redis->publish($channelName, json_encode($message));
            
            Log::info('Сообщение отправлено через WebSocket', [
                'event' => $event,
                'channel' => $channelName
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Ошибка отправки WebSocket сообщения', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    public function broadcast(string $event, array $data, array $channels = []): bool
    {
        try {
            if (empty($channels)) {
                $channels = [$this->channel];
            }

            $message = [
                'event' => $event,
                'data' => $data,
                'timestamp' => now()->timestamp
            ];

            $jsonMessage = json_encode($message);

            foreach ($channels as $channel) {
                $this->redis->publish($channel, $jsonMessage);
            }

            Log::info('Широковещательное сообщение отправлено', [
                'event' => $event,
                'channels_count' => count($channels)
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Ошибка широковещательной отправки', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    public function sendToUser(int $userId, string $event, array $data): bool
    {
        $channel = "user.{$userId}";
        return $this->send($event, $data, $channel);
    }

    public function sendToRoom(string $roomId, string $event, array $data): bool
    {
        $channel = "room.{$roomId}";
        return $this->send($event, $data, $channel);
    }

    public function setChannel(string $channel): self
    {
        $this->channel = $channel;
        return $this;
    }

    public function getActiveConnections(): int
    {
        try {
            $keys = $this->redis->keys('websocket:connections:*');
            return count($keys);
        } catch (\Exception $e) {
            Log::error('Ошибка получения активных подключений', [
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }

    public function isUserOnline(int $userId): bool
    {
        try {
            return $this->redis->exists("websocket:user:{$userId}") > 0;
        } catch (\Exception $e) {
            Log::error('Ошибка проверки статуса пользователя', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}

