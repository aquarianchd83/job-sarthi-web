import { Component, OnInit, inject, signal } from '@angular/core';
import { Job, ShortlistStats } from '../../core/models/job.model';
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

@Component({
  selector: 'app-shortlist',
  standalone: true,
  imports: [IstDatePipe, TailorPanelComponent],
  templateUrl: './shortlist.component.html',
  styleUrl: './shortlist.component.scss',
})
export class ShortlistComponent implements OnInit {
  private api = inject(ShortlistService);
  jobs = signal<Job[]>([]);
  stats = signal<ShortlistStats | null>(null);
  filter = signal<'all' | 'auto' | 'manual'>('all');
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
  }

  rescore() {
    this.busy.set(true);
    this.api.rescore().subscribe({ next: () => { this.busy.set(false); this.load(); }, error: () => this.busy.set(false) });
  }

  visible() {
    const f = this.filter();
    return this.jobs().filter(j => (f === 'all' || (f === 'auto' ? j.canAutoApply : !j.canAutoApply))
      && j.fitScore >= this.fitMin() && j.fitScore <= this.fitMax());
  }
  label(key: string) { return LABELS[key] ?? key; }
  badge(j: Job) { return j.canAutoApply ? 'auto' : j.sourceKey === 'naukri' || j.sourceKey === 'linkedin' ? 'alert' : 'fetch'; }
}
