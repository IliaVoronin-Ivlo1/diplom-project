<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        try {
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Регистрация прошла успешно',
                'token' => $token,
                'user' => [
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('AuthController[register]', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Ошибка сервера при регистрации'
            ], 500);
        }
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Неверный email или пароль'
            ], 401);
        }

        try {
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Авторизация прошла успешно',
                'token' => $token,
                'user' => [
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('AuthController[login]', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Ошибка сервера при авторизации'
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Выход выполнен успешно'
            ], 200);
        } catch (\Exception $e) {
            Log::error('AuthController[logout]', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Ошибка сервера при выходе'
            ], 500);
        }
    }

    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ], 200);
    }
}

