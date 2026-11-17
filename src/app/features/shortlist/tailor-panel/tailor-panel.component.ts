import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Job } from '../../../core/models/job.model';
import { TailorResult } from '../../../core/models/tailor.model';
import { TailorService } from '../../../core/services/tailor.service';
import { IstDatePipe } from '../../../shared/pipes/ist-date.pipe';

const ENGINE_LABEL: Record<string, string> = { rule: 'Rule-based', gemini: 'Gemini', ollama: 'Ollama' };

@Component({
  selector: 'app-tailor-panel',
  standalone: true,
  imports: [FormsModule, IstDatePipe],
  templateUrl: './tailor-panel.component.html',
  styleUrl: './tailor-panel.component.scss',
})
export class TailorPanelComponent implements OnInit {
  private api = inject(TailorService);
  job = input.required<Job>();
  closed = output<void>();

  result = signal<TailorResult | null>(null);
  letter = signal('');
  busy = signal(true);
  error = signal('');
  msg = signal('');

  ngOnInit() {
    // Show the saved version if there is one, otherwise tailor right away.
    this.api.get(this.job().id).subscribe({
      next: r => this.show(r),
      error: (e: HttpErrorResponse) => (e.status === 404 ? this.regenerate() : this.fail(e)),
    });
  }

  engineLabel(e: string) { return ENGINE_LABEL[e] ?? e; }
  dirty() { return this.result() !== null && this.letter() !== this.result()!.coverLetter; }

  regenerate() {
    this.busy.set(true);
    this.error.set('');
    this.api.run(this.job().id).subscribe({ next: r => this.show(r), error: e => this.fail(e) });
  }

  saveEdits() {
    this.error.set('');
    this.api.saveLetter(this.job().id, this.letter()).subscribe({
      next: r => { this.result.set(r); this.flash('Cover letter saved'); },
      error: e => this.fail(e),
    });
  }

  async copy() {
    try {
      await navigator.clipboard.writeText(this.letter());
      this.flash('Copied');
    } catch {
      this.flash('Copy blocked by the browser. Select the text and copy it.');
    }
  }

  private show(r: TailorResult) { this.result.set(r); this.letter.set(r.coverLetter); this.busy.set(false); }
  private fail(e: HttpErrorResponse) {
    this.busy.set(false);
    this.error.set(typeof e.error === 'string' && e.error ? e.error : 'Could not reach the API.');
  }
  private flash(m: string) { this.msg.set(m); setTimeout(() => this.msg.set(''), 2500); }
}
