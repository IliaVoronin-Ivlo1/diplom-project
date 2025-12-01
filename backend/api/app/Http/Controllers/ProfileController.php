<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateNameRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    public function updateName(UpdateNameRequest $request)
    {
        try {
            $user = $request->user();
            $user->name = $request->name;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Имя успешно обновлено',
                'user' => [
                    'email' => $user->email,
                    'name' => $user->name,
                    'created_at' => $user->created_at,
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('ProfileController[updateName]', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Ошибка сервера при обновлении имени'
            ], 500);
        }
    }

    public function requestPasswordReset(Request $request)
    {
        try {
            $user = $request->user();
            
            DB::table('password_reset_tokens')->where('email', $user->email)->delete();

            $token = Str::random(32);
            
            DB::table('password_reset_tokens')->insert([
                'email' => $user->email,
                'token' => Hash::make($token),
                'created_at' => now(),
            ]);

            $resetUrl = env('FRONTEND_URL', 'http://localhost:8080') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

            Mail::to($user->email)->send(new ResetPasswordMail($resetUrl, $user->email));

            return response()->json([
                'success' => true,
                'message' => 'Письмо с инструкциями отправлено на ваш email'
            ], 200);
        } catch (\Exception $e) {
            Log::error('ProfileController[requestPasswordReset]', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Ошибка сервера при запросе смены пароля'
            ], 500);
        }
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        try {
            $user = User::where('email', $request->email)->first();
            
            DB::table('password_reset_tokens')->where('email', $user->email)->delete();

            $token = Str::random(32);
            
            DB::table('password_reset_tokens')->insert([
                'email' => $user->email,
                'token' => Hash::make($token),
                'created_at' => now(),
            ]);

            $resetUrl = env('FRONTEND_URL', 'http://localhost:8080') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

            Mail::to($user->email)->send(new ResetPasswordMail($resetUrl, $user->email));

            return response()->json([
                'success' => true,
                'message' => 'Письмо с инструкциями отправлено на ваш email'
            ], 200);
        } catch (\Exception $e) {
            Log::error('ProfileController[forgotPassword]', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Ошибка сервера при запросе сброса пароля'
            ], 500);
        }
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $email = $request->query('email');
        $token = $request->query('token');

        if (!$email || !$token) {
            return response()->json([
                'message' => 'Неверные параметры запроса'
            ], 400);
        }

        try {
            $resetRecord = DB::table('password_reset_tokens')
                ->where('email', $email)
                ->first();

            if (!$resetRecord) {
                return response()->json([
                    'message' => 'Токен не найден'
                ], 404);
            }

            if (!Hash::check($token, $resetRecord->token)) {
                return response()->json([
                    'message' => 'Неверный токен'
                ], 401);
            }

            if (now()->diffInHours($resetRecord->created_at) > 1) {
                DB::table('password_reset_tokens')->where('email', $email)->delete();
                return response()->json([
                    'message' => 'Срок действия токена истек'
                ], 410);
            }

            $user = User::where('email', $email)->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Пользователь не найден'
                ], 404);
            }

            $user->password = Hash::make($request->password);
            $user->save();

            DB::table('password_reset_tokens')->where('email', $email)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Пароль успешно изменен'
            ], 200);
        } catch (\Exception $e) {
            Log::error('ProfileController[resetPassword]', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Ошибка сервера при смене пароля'
            ], 500);
        }
    }
}
