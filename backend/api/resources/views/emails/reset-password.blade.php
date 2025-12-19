<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Смена пароля</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(180deg, #0a0b0d 0%, #12141a 100%);
            padding: 40px 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #12141a;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
            border: 1px solid #2a2d35;
        }
        
        .header {
            background: linear-gradient(135deg, #1a1d25 0%, #23262f 100%);
            padding: 40px 30px;
            text-align: center;
            border-bottom: 2px solid;
            border-image: linear-gradient(90deg, transparent, #4a9eff, transparent) 1;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #4a9eff 0%, #2a5f9e 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(74, 158, 255, 0.4);
        }
        
        .logo-text {
            font-size: 48px;
            font-weight: 700;
            color: #0a0b0d;
            font-family: Georgia, serif;
        }
        
        .header-title {
            font-size: 28px;
            font-weight: 600;
            color: #e4e6eb;
            margin-bottom: 8px;
        }
        
        .header-subtitle {
            font-size: 16px;
            color: #8b92a4;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #e4e6eb;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #8b92a4;
            margin-bottom: 30px;
        }
        
        .email-box {
            background: #1a1d25;
            border: 1px solid #2a2d35;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 30px;
        }
        
        .email-label {
            font-size: 13px;
            color: #8b92a4;
            margin-bottom: 8px;
        }
        
        .email-value {
            font-size: 16px;
            color: #4a9eff;
            font-weight: 600;
        }
        
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .reset-button {
            display: inline-block;
            padding: 16px 48px;
            background: linear-gradient(135deg, #4a9eff 0%, #2a5f9e 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.3px;
            box-shadow: 0 4px 12px rgba(74, 158, 255, 0.4);
            transition: all 0.3s ease;
        }
        
        .reset-button:hover {
            box-shadow: 0 6px 16px rgba(74, 158, 255, 0.5);
            transform: translateY(-2px);
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #2a2d35, transparent);
            margin: 30px 0;
        }
        
        .info-text {
            font-size: 14px;
            color: #5a6070;
            line-height: 1.6;
            margin-bottom: 12px;
        }
        
        .link-box {
            background: #0f1015;
            border: 1px solid #2a2d35;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            word-break: break-all;
        }
        
        .link-text {
            font-size: 13px;
            color: #4a9eff;
            text-decoration: none;
        }
        
        .footer {
            background: #0a0b0d;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #2a2d35;
        }
        
        .footer-text {
            font-size: 13px;
            color: #5a6070;
            line-height: 1.6;
        }
        
        .footer-brand {
            color: #4a9eff;
            font-weight: 600;
            text-decoration: none;
        }
        
        @media only screen and (max-width: 600px) {
            body {
                padding: 20px 10px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .header-title {
                font-size: 24px;
            }
            
            .reset-button {
                padding: 14px 36px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <div class="logo-text">C</div>
            </div>
            <h1 class="header-title">Смена пароля</h1>
            <p class="header-subtitle">Corstat - Анализ поставщиков автозапчастей</p>
        </div>
        
        <div class="content">
            <p class="greeting">Здравствуйте!</p>
            
            <p class="message">
                Вы получили это письмо, потому что был сделан запрос на смену пароля для вашего аккаунта в системе Corstat.
            </p>
            
            <div class="email-box">
                <div class="email-label">Ваш email:</div>
                <div class="email-value">{{ $email }}</div>
            </div>
            
            <p class="message">
                Для установки нового пароля нажмите на кнопку ниже:
            </p>
            
            <div class="button-container">
                <a href="{{ $resetUrl }}" class="reset-button">
                    Сменить пароль
                </a>
            </div>
            
            <div class="divider"></div>
            
            <p class="info-text">
                Если кнопка не работает, скопируйте и вставьте эту ссылку в адресную строку браузера:
            </p>
            
            <div class="link-box">
                <a href="{{ $resetUrl }}" class="link-text">{{ $resetUrl }}</a>
            </div>
            
            <p class="info-text">
                <strong>Важно:</strong> Ссылка действительна в течение 1 часа. После истечения этого срока вам потребуется повторно запросить смену пароля.
            </p>
            
            <div class="divider"></div>
            
            <p class="info-text">
                Если вы не запрашивали смену пароля, просто проигнорируйте это письмо. Ваш пароль останется без изменений.
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                С уважением,<br>
                Команда <a href="http://localhost:8080" class="footer-brand">Corstat</a>
            </p>
            <p class="footer-text" style="margin-top: 16px;">
                Это автоматическое письмо, пожалуйста, не отвечайте на него.
            </p>
        </div>
    </div>
</body>
</html>

