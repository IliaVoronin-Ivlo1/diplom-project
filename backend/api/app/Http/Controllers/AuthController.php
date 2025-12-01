<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\EmailVerification;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Mail\VerifyEmailMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        try {
            EmailVerification::where('email', $request->email)->delete();

            $token = Str::random(32);
            
            EmailVerification::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'token' => $token,
                'expires_at' => now()->addHours(24),
            ]);

            $verificationUrl = env('APP_URL') . '/api/auth/verify-email?token=' . $token;

            Mail::to($request->email)->send(new VerifyEmailMail($verificationUrl, $request->email));

            return response()->json([
                'success' => true,
                'message' => 'Письмо с подтверждением отправлено на ваш email'
            ], 200);
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

    public function verifyEmail(Request $request)
    {
        $token = $request->query('token');

        if (!$token) {
            return redirect(env('FRONTEND_URL', 'http://localhost:8080') . '/login?error=invalid_token');
        }

        try {
            $verification = EmailVerification::where('token', $token)->first();

            if (!$verification) {
                return redirect(env('FRONTEND_URL', 'http://localhost:8080') . '/login?error=invalid_token');
            }

            if (now()->greaterThan($verification->expires_at)) {
                $verification->delete();
                return redirect(env('FRONTEND_URL', 'http://localhost:8080') . '/login?error=token_expired');
            }

            $user = User::create([
                'email' => $verification->email,
                'password' => $verification->password,
            ]);

            $verification->delete();

            $authToken = $user->createToken('auth_token')->plainTextToken;

            return redirect(env('FRONTEND_URL', 'http://localhost:8080') . '/profile?token=' . $authToken . '&registered=true');
        } catch (\Exception $e) {
            Log::error('AuthController[verifyEmail]', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect(env('FRONTEND_URL', 'http://localhost:8080') . '/login?error=server_error');
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

