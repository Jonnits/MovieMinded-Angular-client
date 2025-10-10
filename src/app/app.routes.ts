import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'welcome', loadComponent: () => import('./welcome-page/welcome-page').then(m => m.WelcomePageComponent) },
  { path: 'movies', loadComponent: () => import('./movie-card/movie-card').then(m => m.MovieCardComponent) },
  { path: 'profile', loadComponent: () => import('./user-profile/user-profile').then(m => m.UserProfileComponent) },
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
];