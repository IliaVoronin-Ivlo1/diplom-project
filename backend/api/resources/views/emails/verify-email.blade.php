<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Подтверждение регистрации</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(180deg, #eef0f4 0%, #e5e7eb 100%);
            padding: 40px 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
            border: 1px solid #e0e3e8;
        }
        
        .header {
            background: linear-gradient(135deg, #f8f9fb 0%, #f1f3f5 100%);
            padding: 40px 30px;
            text-align: center;
            border-bottom: 2px solid #4a9eff;
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
            box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
        }
        
        .logo-text {
            font-size: 48px;
            font-weight: 700;
            color: #ffffff;
            font-family: Georgia, serif;
        }
        
        .header-title {
            font-size: 28px;
            font-weight: 600;
            color: #1a1d25;
            margin-bottom: 8px;
        }
        
        .header-subtitle {
            font-size: 16px;
            color: #5a6070;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #1a1d25;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #4b5563;
            margin-bottom: 30px;
        }
        
        .email-box {
            background: #f8f9fb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 30px;
        }
        
        .email-label {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        
        .email-value {
            font-size: 16px;
            color: #2563eb;
            font-weight: 600;
        }
        
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .verify-button {
            display: inline-block;
            padding: 16px 48px;
            background: linear-gradient(135deg, #4a9eff 0%, #2a5f9e 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.3px;
            box-shadow: 0 2px 8px rgba(74, 158, 255, 0.35);
            transition: all 0.3s ease;
        }
        
        .verify-button:hover {
            box-shadow: 0 4px 12px rgba(74, 158, 255, 0.45);
            transform: translateY(-2px);
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
            margin: 30px 0;
        }
        
        .info-text {
            font-size: 14px;
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 12px;
        }
        
        .link-box {
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            word-break: break-all;
        }
        
        .link-text {
            font-size: 13px;
            color: #2563eb;
            text-decoration: none;
        }
        
        .footer {
            background: #f8f9fb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
            font-size: 13px;
            color: #6b7280;
            line-height: 1.6;
        }
        
        .footer-brand {
            color: #2563eb;
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
            
            .verify-button {
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
            <h1 class="header-title">Подтверждение регистрации</h1>
            <p class="header-subtitle">Corstat - Анализ поставщиков автозапчастей</p>
        </div>
        
        <div class="content">
            <p class="greeting">Здравствуйте!</p>
            
            <p class="message">
                Вы получили это письмо, потому что была создана заявка на регистрацию в системе Corstat с использованием этого адреса электронной почты.
            </p>
            
            <div class="email-box">
                <div class="email-label">Email для регистрации:</div>
                <div class="email-value">{{ $email }}</div>
            </div>
            
            <p class="message">
                Для завершения регистрации и активации вашего аккаунта, пожалуйста, нажмите на кнопку ниже:
            </p>
            
            <div class="button-container">
                <a href="{{ $verificationUrl }}" class="verify-button">
                    Подтвердить регистрацию
                </a>
            </div>
            
            <div class="divider"></div>
            
            <p class="info-text">
                Если кнопка не работает, скопируйте и вставьте эту ссылку в адресную строку браузера:
            </p>
            
            <div class="link-box">
                <a href="{{ $verificationUrl }}" class="link-text">{{ $verificationUrl }}</a>
            </div>
            
            <p class="info-text">
                <strong>Важно:</strong> Ссылка действительна в течение 24 часов. После истечения этого срока вам потребуется повторно запросить регистрацию.
            </p>
            
            <div class="divider"></div>
            
            <p class="info-text">
                Если вы не регистрировались на платформе Corstat, просто проигнорируйте это письмо. Ваш email не будет использован без подтверждения.
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

