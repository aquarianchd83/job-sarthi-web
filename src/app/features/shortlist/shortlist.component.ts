import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ApplyCategory, CategoryCounts, Job, ShortlistStats } from '../../core/models/job.model';
import { ShortlistService } from '../../core/services/shortlist.service';
import { RulesService } from '../../core/services/rules.service';
import { ApplicationsService } from '../../core/services/applications.service';
import { HttpErrorResponse } from '@angular/common/http';
import { IstDatePipe } from '../../shared/pipes/ist-date.pipe';
import { TailorPanelComponent } from './tailor-panel/tailor-panel.component';

const LABELS: Record<string, string> = {
  greenhouse: 'Greenhouse', lever: 'Lever', ashby: 'Ashby', remoteok: 'RemoteOK',
  weworkremotely: 'WeWorkRemotely', naukri: 'Naukri alert', linkedin: 'LinkedIn alert',
};

const VIEW_KEY = 'shortlist.view';
function readView(): 'grouped' | 'list' {
  try { return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grouped'; } catch { return 'grouped'; }
}
const GROUPS: { key: ApplyCategory; title: string; hint: string }[] = [
  { key: 'Api', title: 'API apply', hint: 'Greenhouse, Lever, Ashby, Workable. The form is filled for you' },
  { key: 'Email', title: 'Email apply', hint: 'Send your resume by email. Draft ready, you send it' },
  { key: 'Manual', title: 'Manual apply', hint: 'Draft and link ready. You press Submit' },
];

@Component({
  selector: 'app-shortlist',
  standalone: true,
  imports: [IstDatePipe, TailorPanelComponent, NgTemplateOutlet],
  templateUrl: './shortlist.component.html',
  styleUrl: './shortlist.component.scss',
})
export class ShortlistComponent implements OnInit {
  private api = inject(ShortlistService);
  jobs = signal<Job[]>([]);
  stats = signal<ShortlistStats | null>(null);
  filter = signal<'all' | ApplyCategory>('all');
  counts = signal<CategoryCounts | null>(null);
  /** Grouped by apply category (default) or one list. Remembered on this browser. */
  view = signal<'grouped' | 'list'>(readView());
  setView(v: 'grouped' | 'list') { this.view.set(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* storage blocked */ } }
  private inFit = (j: Job) => j.fitScore >= this.fitMin() && j.fitScore <= this.fitMax();
  groups = computed(() => GROUPS.map(g => ({ ...g, jobs: this.jobs().filter(j => j.applyCategory === g.key && this.inFit(j)) })));
  unsorted = computed(() => this.jobs().filter(j => !j.applyCategory && this.inFit(j)));
  checking = signal(false);
  // Quick view filter on top of the saved rule. Not saved: change the range in Rules to make it permanent.
  fitMin = signal(0);
  fitMax = signal(100);
  private rulesApi = inject(RulesService);
  setFit(which: 'min' | 'max', raw: string) {
    const n = Math.min(100, Math.max(0, Number(raw) || (which === 'min' ? 0 : 100)));
    (which === 'min' ? this.fitMin : this.fitMax).set(n);
  }
  error = signal('');
  busy = signal(false);
  tailoring = signal<Job | null>(null);
  toast = signal('');
  private apps = inject(ApplicationsService);

  apply(j: Job) {
    this.apps.apply(j.id).subscribe({
      next: () => this.flash(`Started. Follow "${j.title}" in Applications.`),
      error: (e: HttpErrorResponse) => this.flash(typeof e.error === 'string' && e.error ? e.error : 'Could not start the application.'),
    });
  }
  /** Email / Manual: cover letter and draft ready (Manual opens pre-filled in your browser when Playwright MCP is on). */
  draft(j: Job) {
    this.apps.draft(j.id).subscribe({
      next: () => this.flash(j.applyCategory === 'Email'
        ? `Email draft for "${j.title}" is ready in Applications.`
        : `Preparing "${j.title}". Nothing is submitted, you press Submit yourself.`),
      error: (e: HttpErrorResponse) => this.flash(typeof e.error === 'string' && e.error ? e.error : 'Could not prepare the draft.'),
    });
  }
  /** Re-sort jobs and open the shortlist's apply pages to drop the ones no longer accepting applications. */
  checkPages() {
    this.checking.set(true);
    this.api.classify(true).subscribe({
      next: r => {
        this.checking.set(false);
        const p = r.pages;
        this.flash(p ? `Checked ${p.checked} apply pages: ${p.closed} closed and hidden, ${p.upgraded} moved to API apply.` : 'Jobs re-sorted.');
        this.load();
      },
      error: () => { this.checking.set(false); this.flash('Could not check the apply pages.'); },
    });
  }
  markApplied(j: Job) {
    this.apps.markApplied(j.id).subscribe({
      next: () => this.flash(`Marked "${j.title}" as applied.`),
      error: () => this.flash('Could not mark it as applied.'),
    });
  }
  private flash(m: string) { this.toast.set(m); setTimeout(() => this.toast.set(''), 5000); }

  ngOnInit() {
    this.load();
    this.rulesApi.get().subscribe({ next: r => { this.fitMin.set(r.minFitScore); this.fitMax.set(r.maxFitScore); }, error: () => {} });
  }

  load() {
    this.api.getShortlist(200).subscribe({
      next: j => { this.jobs.set(j); this.error.set(''); },
      error: () => this.error.set('Cannot reach the API. Is job-sarthi-api running on port 5000?'),
    });
    this.api.getStats().subscribe({ next: s => this.stats.set(s), error: () => {} });
    this.api.categories().subscribe({ next: c => this.counts.set(c), error: () => {} });
  }

  rescore() {
    this.busy.set(true);
    this.api.rescore().subscribe({ next: () => { this.busy.set(false); this.load(); }, error: () => this.busy.set(false) });
  }

  visible() {
    const f = this.filter();
    return this.jobs().filter(j => (f === 'all' || j.applyCategory === f)
      && j.fitScore >= this.fitMin() && j.fitScore <= this.fitMax());
  }
  count(c: ApplyCategory) { return this.jobs().filter(j => j.applyCategory === c).length; }
  catLabel(j: Job) {
    switch (j.applyCategory) {
      case 'Api': return 'API' + (j.atsKey ? ' · ' + (LABELS[j.atsKey] ?? j.atsKey) : '');
      case 'Email': return 'Email';
      case 'Manual': return 'Manual';
      default: return 'Not sorted';
    }
  }
  catClass(j: Job) { return 'b cat-' + (j.applyCategory ?? 'none').toLowerCase(); }
  link(j: Job) { return j.applyUrl || j.url; }
  label(key: string) { return LABELS[key] ?? key; }
  badge(j: Job) { return j.canAutoApply ? 'auto' : j.sourceKey === 'naukri' || j.sourceKey === 'linkedin' ? 'alert' : 'fetch'; }
}
