'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { wsClient } from '@/lib/websocket';
import apiClient from '@/lib/api';
import authService from '@/services/auth.service';

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [apiStatus, setApiStatus] = useState<string>('проверка');
  const [backendResponse, setBackendResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const registered = searchParams.get('registered');

    if (token && registered === 'true') {
      authService.setToken(token);
      setRegistrationSuccess(true);
      
      window.history.replaceState({}, '', '/');
      
      setTimeout(() => {
        setRegistrationSuccess(false);
      }, 5000);
    }

    wsClient.connect();

    wsClient.on('connect', () => {
      setIsConnected(true);
    });

    wsClient.on('disconnect', () => {
      setIsConnected(false);
    });

    wsClient.on('message', (data: any) => {
      setMessages((prev) => [...prev, data]);
    });

    checkApiHealth();

    return () => {
      wsClient.disconnect();
    };
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await apiClient.get('/health');
      setApiStatus(response.data.status);
    } catch (error) {
      setApiStatus('недоступен');
    }
  };

  const sendTestMessage = () => {
    wsClient.emit('test', { message: 'Тестовое сообщение' });
  };

  const testBackendRequest = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/test');
      setBackendResponse(response.data);
    } catch (error: any) {
      setBackendResponse({ 
        error: 'Ошибка запроса', 
        details: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const testBackendPost = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/test', {
        test_field: 'Тестовые данные с фронтенда',
        timestamp: new Date().toISOString()
      });
      setBackendResponse(response.data);
    } catch (error: any) {
      setBackendResponse({ 
        error: 'Ошибка запроса', 
        details: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333' }}>Diplom Project - Corstat</h1>
      
      {registrationSuccess && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#155724'
        }}>
          <strong>Регистрация успешно завершена!</strong> Добро пожаловать в систему Corstat.
        </div>
      )}
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>Статус подключений</h2>
        <p>WebSocket: <strong style={{ color: isConnected ? 'green' : 'red' }}>
          {isConnected ? 'подключен' : 'отключен'}
        </strong></p>
        <p>Backend API: <strong style={{ color: apiStatus === 'healthy' ? 'green' : 'red' }}>
          {apiStatus}
        </strong></p>
      </div>

      <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>Тестирование Backend</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button 
            onClick={testBackendRequest}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Загрузка...' : 'GET запрос к Backend'}
          </button>

          <button 
            onClick={testBackendPost}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Загрузка...' : 'POST запрос к Backend'}
          </button>
        </div>

        {backendResponse && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            marginTop: '15px'
          }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Ответ от Backend:</h3>
            <pre style={{ 
              backgroundColor: '#fff',
              padding: '10px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '14px'
            }}>
              {JSON.stringify(backendResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>WebSocket тестирование</h2>
        <button 
          onClick={sendTestMessage}
          disabled={!isConnected}
          style={{
            padding: '10px 20px',
            backgroundColor: isConnected ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isConnected ? 'pointer' : 'not-allowed'
          }}
        >
          Отправить тестовое сообщение
        </button>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>Полученные сообщения</h2>
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px', 
          padding: '10px',
          maxHeight: '300px',
          overflowY: 'auto',
          backgroundColor: '#fafafa'
        }}>
          {messages.length === 0 ? (
            <p style={{ color: '#999' }}>Нет сообщений</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} style={{ 
                padding: '8px', 
                borderBottom: '1px solid #eee',
                marginBottom: '5px',
                backgroundColor: '#fff',
                borderRadius: '4px'
              }}>
                {JSON.stringify(msg)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

