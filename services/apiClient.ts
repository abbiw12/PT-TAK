import io, { Socket } from 'socket.io-client';
import { TrainingProgram, CompletionRecord, HealthMetric, User } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface AuthResponse {
  token: string;
  user: User;
  profileIncomplete?: boolean;
}

class ApiClient {
  private token: string | null = null;
  private socket: Socket | null = null;
  private socketListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.token = localStorage.getItem('auth_token');
    console.log('[ApiClient] Initialized with API_URL:', API_URL);
  }

  // Auth Methods
  async register(name: string, email: string, password: string, role: 'host' | 'user'): Promise<AuthResponse> {
    console.log('[ApiClient] POST /api/auth/register - name:', name, 'email:', email, 'role:', role);
    
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await response.json();
    console.log('[ApiClient] Register response:', { status: response.status, data });

    if (!response.ok) {
      const errorMsg = data.error || 'Registration failed';
      console.error('[ApiClient] Registration error:', errorMsg);
      throw new Error(errorMsg);
    }

    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    this.initSocket();
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('[ApiClient] POST /api/auth/login - email:', email);
    
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log('[ApiClient] Login response:', { status: response.status, data });

    if (!response.ok) {
      const errorMsg = data.error || 'Login failed';
      console.error('[ApiClient] Login error:', errorMsg);
      throw new Error(errorMsg);
    }

    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    this.initSocket();
    return data;
  }

  async getMe() {
    return this.request('/api/auth/me', 'GET');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    this.disconnectSocket();
  }

  // Program Methods
  async createProgram(program: Omit<TrainingProgram, 'id' | 'createdAt' | 'assignedUserIds' | 'hostId'>): Promise<TrainingProgram> {
    return this.request('/api/programs', 'POST', program);
  }

  async getPrograms(): Promise<TrainingProgram[]> {
    return this.request('/api/programs', 'GET');
  }

  async getProgram(id: string): Promise<TrainingProgram> {
    return this.request(`/api/programs/${id}`, 'GET');
  }

  async updateProgram(id: string, updates: Partial<TrainingProgram>): Promise<TrainingProgram> {
    return this.request(`/api/programs/${id}`, 'PUT', updates);
  }

  async assignProgram(programId: string, userId: string): Promise<TrainingProgram> {
    return this.request(`/api/programs/${programId}/assign`, 'POST', { userId });
  }

  // Completion Methods
  async completeWorkout(workoutId: string, programId: string): Promise<CompletionRecord> {
    return this.request('/api/completions', 'POST', { workoutId, programId });
  }

  async getCompletions(): Promise<CompletionRecord[]> {
    return this.request('/api/completions', 'GET');
  }

  // User Methods
  async getTrainees(): Promise<User[]> {
    return this.request('/api/users', 'GET');
  }

  async updateProfile(profile: { dateOfBirth?: string; height?: number; weight?: number }) {
    return this.request('/api/auth/profile', 'PUT', profile);
  }

  async updateLocation(latitude: number, longitude: number) {
    return this.request('/api/auth/location', 'POST', { latitude, longitude });
  }

  async getHealthMetrics(): Promise<HealthMetric[]> {
    return this.request('/api/health/metrics', 'GET');
  }

  async addHealthMetric(metric: {
    steps?: number;
    heartRate?: number;
    caloriesBurned?: number;
    sleepHours?: number;
    distanceKm?: number;
    notes?: string;
  }): Promise<HealthMetric> {
    return this.request('/api/health/metrics', 'POST', metric);
  }

  // Socket.io Methods
  initSocket() {
    if (this.socket) return;

    try {
      this.socket = io(API_URL, {
        auth: { token: this.token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('[Socket.io] Connected to real-time server');
        if (this.token) {
          this.socket?.emit('user:authenticate', this.token);
        }
      });

      this.socket.on('authenticated', (data) => {
        console.log('[Socket.io] Authenticated:', data);
      });

      this.socket.on('program:created', (program: TrainingProgram) => {
        this.emit('program:created', program);
      });

      this.socket.on('program:updated', (program: TrainingProgram) => {
        this.emit('program:updated', program);
      });

      this.socket.on('program:assigned', (data) => {
        this.emit('program:assigned', data);
      });

      this.socket.on('workout:completed', (completion: CompletionRecord) => {
        this.emit('workout:completed', completion);
      });

      this.socket.on('error', (error) => {
        console.error('[Socket.io] Error:', error);
      });

      this.socket.on('disconnect', () => {
        console.log('[Socket.io] Disconnected');
      });
    } catch (error) {
      console.error('[Socket.io] Failed to initialize:', error);
    }
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Event Listeners
  on(event: string, callback: Function) {
    if (!this.socketListeners.has(event)) {
      this.socketListeners.set(event, []);
    }
    this.socketListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.socketListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.socketListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Helper method
  private async request(endpoint: string, method: string, body?: any) {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const url = `${API_URL}${endpoint}`;
    console.log(`[ApiClient] ${method} ${url}`);

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
        }
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return response.json();
    } catch (error: any) {
      console.error(`[ApiClient] Request failed:`, error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
