<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\UpdateUserRequest;

class AdminController extends Controller
{
    public function getUsers(Request $request)
    {
        try {
            $perPage = 10;
            $page = $request->get('page', 1);

            $users = User::select('id', 'name', 'email', 'role', 'email_verified_at', 'created_at')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $users->items(),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                    'from' => $users->firstItem(),
                    'to' => $users->lastItem(),
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('AdminController[getUsers]', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Ошибка сервера при получении списка пользователей'
            ], 500);
        }
    }

    public function updateUser(UpdateUserRequest $request, int $userId)
    {
        try {
            $user = User::findOrFail($userId);

            if ($request->has('name')) {
                $user->name = $request->input('name');
            }

            if ($request->has('role')) {
                $user->role = $request->input('role');
            }

            $user->save();

            Log::info('AdminController[updateUser]', [
                'user_id' => $userId,
                'updated_fields' => $request->only(['name', 'role'])
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                ]
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Пользователь не найден'
            ], 404);
        } catch (\Exception $e) {
            Log::error('AdminController[updateUser]', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Ошибка сервера при обновлении пользователя'
            ], 500);
        }
    }
}
