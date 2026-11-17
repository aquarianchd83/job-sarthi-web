import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSettings, ChannelResult, ChannelStatus, DailyRun, TelegramChat } from '../../core/models/app-settings.model';
import { NotificationsService } from '../../core/services/notifications.service';
import { EngineStatus } from '../../core/models/tailor.model';
import { SettingsService } from '../../core/services/settings.service';
import { TailorService } from '../../core/services/tailor.service';
import { IstDatePipe } from '../../shared/pipes/ist-date.pipe';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, IstDatePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit, OnDestroy {
  private api = inject(SettingsService);
  private tailorApi = inject(TailorService);
  private notifApi = inject(NotificationsService);
  channels = signal<ChannelStatus[]>([]);
  testResults = signal<ChannelResult[]>([]);
  chats = signal<TelegramChat[] | null>(null);
  chatError = signal('');
  testing = signal(false);

  channel(name: string) { return this.channels().find(c => c.name === name); }
  sendTest() {
    this.testing.set(true);
    this.testResults.set([]);
    this.notifApi.test().subscribe({ next: r => { this.testResults.set(r); this.testing.set(false); }, error: () => this.testing.set(false) });
  }
  findChats() {
    this.chatError.set('');
    this.notifApi.telegramChats().subscribe({
      next: c => this.chats.set(c),
      error: (e: HttpErrorResponse) => { this.chats.set(null); this.chatError.set(typeof e.error === 'string' ? e.error : 'Could not reach Telegram.'); },
    });
  }
  s = signal<AppSettings | null>(null);
  nextRunUtc = signal<string | null>(null);
  engines = signal<EngineStatus[]>([]);
  history = signal<DailyRun[]>([]);
  running = signal(false);
  msg = signal('');
  error = signal('');
  private timer?: ReturnType<typeof setInterval>;

  engine(name: string) { return this.engines().find(e => e.name === name); }

  ngOnInit() {
    this.tailorApi.engines().subscribe({ next: e => this.engines.set(e), error: () => {} });
    this.notifApi.status().subscribe({ next: c => this.channels.set(c), error: () => {} });
    this.api.get().subscribe({
      next: v => { this.s.set(v); this.loadNext(); },
      error: () => this.error.set('Cannot reach the API. Is job-sarthi-api running on port 5000?'),
    });
    this.loadHistory();
    this.api.runStatus().subscribe({ next: r => this.running.set(r.running), error: () => {} });
    this.timer = setInterval(() => { if (this.running()) this.poll(); }, 2500);
  }
  ngOnDestroy() { clearInterval(this.timer); }

  loadNext() { this.api.nextRun().subscribe(r => this.nextRunUtc.set(r.enabled ? r.nextRunUtc : null)); }
  loadHistory() { this.api.history(7).subscribe({ next: h => this.history.set(h), error: () => {} }); }

  save() {
    const v = this.s();
    if (!v) return;
    this.api.save(v).subscribe({
      next: () => { this.flash('Settings saved'); this.error.set(''); this.loadNext(); },
      error: (e: HttpErrorResponse) => this.error.set(typeof e.error === 'string' ? e.error : 'Could not save settings.'),
    });
  }

  runNow() {
    this.error.set('');
    this.api.runNow().subscribe({
      next: () => this.running.set(true),
      error: (e: HttpErrorResponse) => this.error.set(typeof e.error === 'string' ? e.error : 'Could not start the run.'),
    });
  }

  private poll() {
    this.api.runStatus().subscribe(r => {
      if (!r.running) { this.running.set(false); this.loadHistory(); this.loadNext(); this.flash('Run finished'); }
    });
  }

  private flash(m: string) { this.msg.set(m); setTimeout(() => this.msg.set(''), 2500); }
}
