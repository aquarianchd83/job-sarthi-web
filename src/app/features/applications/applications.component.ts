import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApplicationDetail, ApplicationListItem, ApplicationStatus } from '../../core/models/application.model';
import { ApplicationsService } from '../../core/services/applications.service';
import { IstDatePipe } from '../../shared/pipes/ist-date.pipe';

const LABEL: Record<ApplicationStatus, string> = {
  Shortlisted: 'Shortlisted', AwaitingApproval: 'Awaiting approval', Tailoring: 'Tailoring', Applying: 'Applying...',
  PausedNeedsInput: 'Needs you', Submitted: 'Submitted', Failed: 'Failed', ManualApply: 'Manual apply', Cancelled: 'Cancelled', DraftReady: 'Draft ready',
};
// Waiting for you: approve, answer, or send/submit a prepared draft.
const NEEDS: ApplicationStatus[] = ['AwaitingApproval', 'PausedNeedsInput', 'DraftReady'];
const CATEGORY: Record<string, string> = { Api: 'API apply', Email: 'Email apply', Manual: 'Manual apply' };

const CLASS: Record<ApplicationStatus, string> = {
  Shortlisted: 'man', AwaitingApproval: 'wait', Tailoring: 'pause', Applying: 'pause', PausedNeedsInput: 'ask',
  Submitted: 'ok', Failed: 'bad', ManualApply: 'man', Cancelled: 'man', DraftReady: 'wait',
};

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [FormsModule, IstDatePipe],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss',
})
export class ApplicationsComponent implements OnInit, OnDestroy {
  private api = inject(ApplicationsService);
  items = signal<ApplicationListItem[]>([]);
  selected = signal<ApplicationDetail | null>(null);
  filter = signal<'all' | 'needs' | 'submitted' | 'failed'>('all');
  error = signal('');
  answers: Record<number, { text: string; save: boolean }> = {};
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.refresh();
    // While anything is running, keep the list and the open detail fresh.
    this.timer = setInterval(() => {
      if (this.items().some(i => i.status === 'Applying') || this.selected()?.status === 'Applying') this.refresh();
    }, 2500);
  }
  ngOnDestroy() { clearInterval(this.timer); }

  refresh() {
    this.api.list().subscribe({
      next: l => { this.items.set(l); this.error.set(''); },
      error: () => this.error.set('Cannot reach the API. Is job-sarthi-api running on port 5000?'),
    });
    const s = this.selected();
    if (s) this.api.get(s.id).subscribe({ next: d => this.selected.set(d), error: () => {} });
  }

  visible() {
    const f = this.filter();
    return this.items().filter(i =>
      f === 'all' || (f === 'needs' && NEEDS.includes(i.status))
      || (f === 'submitted' && i.status === 'Submitted') || (f === 'failed' && i.status === 'Failed'));
  }
  count(f: 'needs' | 'submitted' | 'failed') {
    return this.items().filter(i => f === 'needs' ? NEEDS.includes(i.status)
      : f === 'submitted' ? i.status === 'Submitted' : i.status === 'Failed').length;
  }

  label(s: ApplicationStatus) { return LABEL[s]; }
  cls(s: ApplicationStatus) { return CLASS[s]; }
  shot(d: ApplicationDetail) { return this.api.screenshotUrl(d.id, d.updatedAtUtc); }
  answerOf(id: number) { return (this.answers[id] ??= { text: '', save: true }); }
  questions(d: ApplicationDetail) { return d.pending.filter(p => p.kind === 'question'); }
  blockers(d: ApplicationDetail) { return d.pending.filter(p => p.kind !== 'question'); }

  select(i: ApplicationListItem) { this.api.get(i.id).subscribe(d => this.selected.set(d)); }

  act(call: () => ReturnType<ApplicationsService['approve']>) {
    this.error.set('');
    call().subscribe({
      next: d => { this.selected.set(d); this.refresh(); },
      error: (e: HttpErrorResponse) => this.error.set(typeof e.error === 'string' && e.error ? e.error : 'That did not work. Try again.'),
    });
  }
  approve(d: ApplicationDetail) { this.act(() => this.api.approve(d.id)); }
  retry(d: ApplicationDetail) { this.act(() => this.api.retry(d.id)); }
  cancel(d: ApplicationDetail) { this.act(() => this.api.cancel(d.id)); }
  manual(d: ApplicationDetail) { this.act(() => this.api.manual(d.id)); }
  markApplied(d: ApplicationDetail) { this.act(() => this.api.markApplied(d.jobId)); }
  category(c: string | null) { return c ? CATEGORY[c] ?? c : ''; }
  link(d: ApplicationDetail) { return d.applyUrl || d.url; }
  /** Opens your mail app with the address, subject and cover letter filled in. You attach the resume and send. */
  mailto(d: ApplicationDetail) {
    const q = `subject=${encodeURIComponent(d.emailSubject ?? '')}&body=${encodeURIComponent(d.coverLetter ?? '')}`;
    return `mailto:${encodeURIComponent(d.applyEmail ?? '')}?${q}`;
  }
  copied = signal('');
  copy(text: string | null, what: string) {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => { this.copied.set(what); setTimeout(() => this.copied.set(''), 2500); }, () => {});
  }
  submitAnswer(d: ApplicationDetail, qid: number) {
    const a = this.answerOf(qid);
    this.act(() => this.api.answer(d.id, qid, a.text, a.save));
  }
}
