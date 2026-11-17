import { Component, OnInit, inject, signal } from '@angular/core';
import { JobSource, SourceRunResult } from '../../core/models/job-source.model';
import { SourcesService } from '../../core/services/sources.service';
import { IstDatePipe } from '../../shared/pipes/ist-date.pipe';

const SLUG_SOURCES = ['greenhouse', 'lever', 'ashby'];

@Component({
  selector: 'app-job-sources',
  standalone: true,
  imports: [IstDatePipe],
  templateUrl: './job-sources.component.html',
  styleUrl: './job-sources.component.scss',
})
export class JobSourcesComponent implements OnInit {
  private api = inject(SourcesService);
  sources = signal<JobSource[]>([]);
  error = signal('');
  running = signal<string | null>(null); // 'all' or a source key
  lastResults = signal<SourceRunResult[]>([]);

  ngOnInit() { this.load(); }

  load() {
    this.api.getAll().subscribe({
      next: s => { this.sources.set(s); this.error.set(''); },
      error: () => this.error.set('Cannot reach the API. Is job-sarthi-api running on port 5000?'),
    });
  }

  usesSlugs(s: JobSource) { return SLUG_SOURCES.includes(s.key); }
  badge(s: JobSource) { return s.capability === 'FetchAndApply' ? 'auto' : s.capability === 'FetchOnly' ? 'fetch' : 'alert'; }
  badgeText(s: JobSource) { return s.capability === 'FetchAndApply' ? 'Auto-apply' : s.capability === 'FetchOnly' ? 'Fetch only' : 'Alerts only'; }

  toggle(s: JobSource) { this.api.setEnabled(s.key, !s.enabled).subscribe(() => this.load()); }
  add(s: JobSource, input: HTMLInputElement) {
    const slug = input.value.trim();
    if (!slug) return;
    this.api.addCompany(s.key, slug).subscribe({
      next: () => { input.value = ''; this.error.set(''); this.load(); },
      error: e => this.error.set(e.status === 409 ? 'Already in the list.' : typeof e.error === 'string' ? e.error : 'Could not add company.'),
    });
  }
  remove(s: JobSource, slug: string) { this.api.removeCompany(s.key, slug).subscribe(() => this.load()); }

  fetchNow(key?: string) {
    this.running.set(key ?? 'all');
    this.api.fetchNow(key).subscribe({
      next: r => { this.lastResults.set(r.sources); this.running.set(null); this.load(); },
      error: () => { this.error.set('Fetch failed. Check the API log.'); this.running.set(null); },
    });
  }

  added(key: string) { return this.lastResults().find(r => r.key === key)?.added; }
}
