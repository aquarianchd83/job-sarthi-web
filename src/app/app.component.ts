import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AlertsStripComponent } from './shared/components/alerts-strip/alerts-strip.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AlertsStripComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  nav = [
    { path: '/shortlist', label: 'Shortlist' },
    { path: '/applications', label: 'Applications' },
    { path: '/sources', label: 'Job Sources' },
    { path: '/rules', label: 'Rules' },
    { path: '/saved-answers', label: 'Saved Answers' },
    { path: '/profile', label: 'Resume & Profile' },
    { path: '/skills', label: 'Skill Gap' },
    { path: '/settings', label: 'Settings' },
  ];
}
