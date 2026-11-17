import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Rule, WorkMode } from '../../core/models/rule.model';
import { RulesService } from '../../core/services/rules.service';
import { ChipInputComponent } from '../../shared/components/chip-input/chip-input.component';

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [FormsModule, ChipInputComponent],
  templateUrl: './rules.component.html',
  styleUrl: './rules.component.scss',
})
export class RulesComponent implements OnInit {
  private api = inject(RulesService);
  rule = signal<Rule | null>(null);
  modes: { label: string; value: WorkMode | null }[] = [
    { label: 'Any', value: null }, { label: 'Remote', value: 'Remote' },
    { label: 'Hybrid', value: 'Hybrid' }, { label: 'Onsite', value: 'Onsite' },
  ];
  msg = signal('');
  error = signal('');
  saving = signal(false);

  ngOnInit() {
    this.api.get().subscribe({
      next: r => this.rule.set(r),
      error: () => this.error.set('Cannot reach the API. Is job-sarthi-api running on port 5000?'),
    });
  }

  patch(p: Partial<Rule>) { this.rule.update(r => (r ? { ...r, ...p } : r)); }

  save() {
    const r = this.rule();
    if (!r) return;
    this.saving.set(true);
    this.api.save(r).subscribe({
      next: s => {
        this.saving.set(false);
        this.error.set('');
        this.msg.set(`Saved. ${s.shortlisted} of ${s.total} fetched jobs match your rules.`);
        setTimeout(() => this.msg.set(''), 5000);
      },
      error: e => { this.saving.set(false); this.error.set(typeof e.error === 'string' ? e.error : 'Could not save rules.'); },
    });
  }
}
