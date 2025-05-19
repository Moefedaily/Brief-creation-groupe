// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ListsComponent } from './components/lists/lists.component';
import { ListDetailComponent } from './components/list-detail/list-detail.component';
import { GroupGeneratorComponent } from './components/group-generator/group-generator.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'lists', component: ListsComponent, canActivate: [authGuard] },
  {
    path: 'lists/:id',
    component: ListDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: 'lists/:id/generate',
    component: GroupGeneratorComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
