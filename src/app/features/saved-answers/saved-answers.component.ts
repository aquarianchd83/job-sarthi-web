import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SavedAnswer } from '../../core/models/application.model';
import { ApplicationsService } from '../../core/services/applications.service';
import { SavedAnswersService } from '../../core/services/saved-answers.service';

@Component({
  selector: 'app-saved-answers',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './saved-answers.component.html',
  styleUrl: './saved-answers.component.scss',
})
export class SavedAnswersComponent implements OnInit {
  private api = inject(SavedAnswersService);
  private apps = inject(ApplicationsService);
  rows = signal<SavedAnswer[]>([]);
  editing = signal<number | null>(null);
  draft = { question: '', answer: '' };
  newQ = '';
  newA = '';
  waiting = signal(0);
  error = signal('');

  ngOnInit() {
    this.load();
    this.apps.list().subscribe({ next: l => this.waiting.set(l.filter(a => a.status === 'PausedNeedsInput').length), error: () => {} });
  }

  load() {
    this.api.list().subscribe({
      next: r => { this.rows.set(r); this.error.set(''); },
      error: () => this.error.set('Cannot reach the API. Is job-sarthi-api running on port 5000?'),
    });
  }

  edit(r: SavedAnswer) { this.editing.set(r.id); this.draft = { question: r.question, answer: r.answer }; }
  save(r: SavedAnswer) {
    this.api.update(r.id, this.draft.question, this.draft.answer).subscribe({
      next: () => { this.editing.set(null); this.load(); },
      error: e => this.fail(e),
    });
  }
  remove(r: SavedAnswer) { this.api.remove(r.id).subscribe(() => this.load()); }
  add() {
    this.api.add(this.newQ, this.newA).subscribe({
      next: () => { this.newQ = ''; this.newA = ''; this.load(); },
      error: e => this.fail(e),
    });
  }
  private fail(e: HttpErrorResponse) { this.error.set(typeof e.error === 'string' && e.error ? e.error : 'Could not save.'); }
}
