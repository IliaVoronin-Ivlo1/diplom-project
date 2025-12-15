<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    public const ROLE_ADMIN = 'Admin';
    public const ROLE_PREMIUM = 'Premium';
    public const ROLE_STANDARD = 'Standard';
    public const ROLE_TRIAL = 'Trial';
    public const ROLE_VISITER = 'Visiter';

    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function emailVerifications(): HasMany
    {
        return $this->hasMany(EmailVerification::class, 'email', 'email');
    }

    public function passwordResetTokens(): HasMany
    {
        return $this->hasMany(PasswordResetToken::class, 'email', 'email');
    }
}
