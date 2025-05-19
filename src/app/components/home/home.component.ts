// src/app/components/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ListService } from '../../services/list.service';
import { List } from '../../models/list';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  recentLists: List[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    public authService: AuthService,
    private listService: ListService,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadRecentLists();
    } else {
      this.isLoading = false;
    }
  }

  loadRecentLists(): void {
    try {
      const allLists = this.listService.getAllLists();
      this.recentLists = allLists.slice(0, 4);
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading lists:', error);
      this.isLoading = false;
    }
  }

  onGetStarted(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/lists']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
