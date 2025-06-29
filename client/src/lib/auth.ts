interface User {
  id: string;
  email: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    this.token = localStorage.getItem('auth-token');
    // Try to get the user data from the token if it exists
    if (this.token) {
      this.getCurrentUser().catch(() => {
        // Token might be invalid, clear it
        this.logout();
      });
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    this.setAuth(data.token, data.user);
    return data;
  }

  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, passwordHash: password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    this.setAuth(data.token, data.user);
    return data;
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const data = await response.json();
      this.user = data.user;
      return data.user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth-token');
  }

  private setAuth(token: string, user: User): void {
    this.token = token;
    this.user = user;
    localStorage.setItem('auth-token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

export const authService = new AuthService();
export type { User, AuthResponse };
