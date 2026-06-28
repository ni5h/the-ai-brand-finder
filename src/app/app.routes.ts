import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((module) => module.Home),
  },
  {
    path: 'generate',
    loadComponent: () => import('./features/generator/generator-page').then((module) => module.GeneratorPage),
  },
  {
    path: 'results',
    loadComponent: () => import('./features/results/results-page').then((module) => module.ResultsPage),
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history-page').then((module) => module.HistoryPage),
  },
  { path: '**', redirectTo: '' },
];
