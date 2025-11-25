import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  private socket: Socket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private eventHandlers: Map<string, Set<Function>> = new Map();

  constructor(url?: string) {
    this.url = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';
  }

  connect(): void {
    if (this.socket?.connected) {
      console.log('WebSocket уже подключен');
      return;
    }

    try {
      this.socket = io(this.url, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.setupEventListeners();
      console.log('Инициализация WebSocket подключения');
    } catch (error) {
      console.error('Ошибка подключения WebSocket', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket подключен');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket отключен', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Ошибка WebSocket', error);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.reconnectAttempts = attemptNumber;
      console.log(`Попытка переподключения ${attemptNumber}`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Не удалось переподключиться к WebSocket');
    });
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    this.eventHandlers.get(event)?.add(handler);

    if (this.socket) {
      this.socket.on(event, (...args) => handler(...args));
    }
  }

  off(event: string, handler?: Function): void {
    if (handler) {
      this.eventHandlers.get(event)?.delete(handler);
      if (this.socket) {
        this.socket.off(event, handler as any);
      }
    } else {
      this.eventHandlers.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      console.log(`Отправлено событие ${event}`);
    } else {
      console.warn('WebSocket не подключен');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.eventHandlers.clear();
      console.log('WebSocket отключен');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const wsClient = new WebSocketClient();
export default WebSocketClient;

