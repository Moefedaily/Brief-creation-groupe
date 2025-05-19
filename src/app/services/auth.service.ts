import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser: User | null = null;

  private mockUsers: User[] = [
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      name: 'Administrator',
      email: 'admin@groupformer.com',
      lastAcceptedTerms: new Date(),
    },
    {
      id: 2,
      username: 'teacher',
      password: 'teacher123',
      name: 'Sample Teacher',
      email: 'teacher@example.com',
      lastAcceptedTerms: new Date(),
    },
  ];

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  login(username: string, password: string): User | null {
    const user = this.mockUsers.find(
      (u) => u.username === username && u.password === password,
    );

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUser = user;
      return user;
    }

    return null;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
  }

  needsToAcceptTerms(): boolean {
    if (!this.currentUser || !this.currentUser.lastAcceptedTerms) return true;

    const lastAccepted = new Date(this.currentUser.lastAcceptedTerms);
    const thirteenMonthsAgo = new Date();
    thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);

    return lastAccepted < thirteenMonthsAgo;
  }

  acceptTerms(): void {
    if (!this.currentUser) return;

    this.currentUser.lastAcceptedTerms = new Date();
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  }

  updateUser(updatedUser: User): void {
    if (!this.currentUser) return;

    Object.assign(this.currentUser, updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  }

  deleteAccount(): void {
    this.logout();
  }
}
