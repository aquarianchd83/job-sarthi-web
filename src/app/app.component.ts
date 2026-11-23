import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AlertsStripComponent } from './shared/components/alerts-strip/alerts-strip.component';

const SIDEBAR_KEY = 'jobSarthi.sidebarCollapsed';
const NARROW_PX = 900;

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

  narrow = signal(isNarrow());
  /** Saved choice wins; with no saved choice, small screens start collapsed. */
  collapsed = signal(readSaved() ?? this.narrow());

  toggleSidebar(): void {
    const next = !this.collapsed();
    this.collapsed.set(next);
    // On a small screen the open sidebar is a temporary overlay, so don't remember it as the choice.
    if (!this.narrow()) save(next);
  }

  /** On a small screen, picking a page closes the overlay. */
  onNavClick(): void {
    if (this.narrow()) this.collapsed.set(true);
  }

  @HostListener('window:resize')
  onResize(): void {
    const n = isNarrow();
    if (n === this.narrow()) return;
    this.narrow.set(n);
    this.collapsed.set(n ? true : readSaved() ?? false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.narrow() && !this.collapsed()) this.collapsed.set(true);
  }
}

function isNarrow(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < NARROW_PX;
}

function readSaved(): boolean | null {
  try {
    const v = localStorage.getItem(SIDEBAR_KEY);
    return v === null ? null : v === '1';
  } catch {
    return null;
  }
}

function save(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
  } catch {
    /* storage blocked: the toggle still works for this visit */
  }
}
