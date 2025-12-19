<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'clustering_service_url' => env('CLUSTERING_SERVICE_URL', 'http://diplom_clustering_service:8005'),
    'genetic_algorithm_service_url' => env('GENETIC_ALGORITHM_SERVICE_URL', 'http://diplom_genetic_algorithm_service:8006'),
    'reverse_genetic_algorithm_service_url' => env('REVERSE_GENETIC_ALGORITHM_SERVICE_URL', 'http://diplom_reverse_genetic_algorithm_service:8007'),
    'seasonality_analysis_service_url' => env('SEASONALITY_ANALYSIS_SERVICE_URL', 'http://diplom_seasonality_analysis_service:8008'),
    'price_forecasting_service_url' => env('PRICE_FORECASTING_SERVICE_URL', 'http://diplom_price_forecasting_service:8009'),

];
