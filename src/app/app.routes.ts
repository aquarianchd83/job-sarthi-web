import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'shortlist' },
  { path: 'profile', loadComponent: () => import('./features/resume-profile/resume-profile.component').then(m => m.ResumeProfileComponent) },
  { path: 'sources', loadComponent: () => import('./features/job-sources/job-sources.component').then(m => m.JobSourcesComponent) },
  { path: 'skills', loadComponent: () => import('./features/skill-gap/skill-gap.component').then(m => m.SkillGapComponent) },
  { path: 'rules', loadComponent: () => import('./features/rules/rules.component').then(m => m.RulesComponent) },
  { path: 'saved-answers', loadComponent: () => import('./features/saved-answers/saved-answers.component').then(m => m.SavedAnswersComponent) },
  { path: 'shortlist', loadComponent: () => import('./features/shortlist/shortlist.component').then(m => m.ShortlistComponent) },
  { path: 'applications', loadComponent: () => import('./features/applications/applications.component').then(m => m.ApplicationsComponent) },
  { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
];
