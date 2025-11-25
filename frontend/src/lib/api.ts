import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return 'http://localhost:8080/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`Запрос ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Ошибка запроса', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`Ответ получен ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Ошибка ответа', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default apiClient;

