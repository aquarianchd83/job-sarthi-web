import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { AppAlert } from '../../../core/models/app-settings.model';
import { SettingsService } from '../../../core/services/settings.service';
import { IstDatePipe } from '../../pipes/ist-date.pipe';

const TITLE: Record<string, string> = {
  source: 'Job source problem', 'apply-failed': 'Application failed', 'run-failed': 'Daily run failed', 'run-missed': 'Daily run missed',
};

/** Open alerts, shown above every screen until you dismiss them. */
@Component({
  selector: 'app-alerts-strip',
  standalone: true,
  imports: [IstDatePipe],
  template: `
    @if (alerts().length > 0) {
      <div class="strip" role="alert">
        <div class="head">
          <b>{{ alerts().length }} thing{{ alerts().length === 1 ? '' : 's' }} need{{ alerts().length === 1 ? 's' : '' }} your attention</b>
          <button class="link" (click)="dismissAll()">Dismiss all</button>
        </div>
        @for (a of alerts().slice(0, 3); track a.id) {
          <div class="item">
            <div><b>{{ title(a.kind) }}.</b> {{ a.message }} <span class="when">{{ a.createdAtUtc | istDate }}</span></div>
            <button class="link" (click)="dismiss(a)" aria-label="Dismiss alert">Dismiss</button>
          </div>
        }
        @if (alerts().length > 3) { <div class="more">and {{ alerts().length - 3 }} more</div> }
      </div>
    }
  `,
  styles: [`
    .strip { background: #fdeceb; border: 1px solid #f3c4c0; color: #6f1710; border-radius: 8px; padding: 12px 16px; margin-bottom: 18px; font-size: 14px; display: flex; flex-direction: column; gap: 8px; }
    .head, .item { display: flex; justify-content: space-between; gap: 16px; align-items: baseline; }
    .when { color: #8a4a45; font-size: 12px; margin-left: 6px; }
    .more { font-size: 12px; color: #8a4a45; }
    .link { border: 0; background: none; color: #6f1710; text-decoration: underline; cursor: pointer; font: inherit; flex: none; }
  `],
})
export class AlertsStripComponent implements OnInit, OnDestroy {
  private api = inject(SettingsService);
  alerts = signal<AppAlert[]>([]);
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() { this.load(); this.timer = setInterval(() => this.load(), 30000); }
  ngOnDestroy() { clearInterval(this.timer); }

  load() { this.api.alerts().subscribe({ next: a => this.alerts.set(a), error: () => {} }); }
  title(k: string) { return TITLE[k] ?? 'Alert'; }
  dismiss(a: AppAlert) { this.api.dismiss(a.id).subscribe(() => this.load()); }
  dismissAll() { this.api.dismissAll().subscribe(() => this.load()); }
}
