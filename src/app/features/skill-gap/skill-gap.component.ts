import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SkillGap } from '../../core/models/skill-gap.model';
import { SkillGapService } from '../../core/services/skill-gap.service';

@Component({
  selector: 'app-skill-gap',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './skill-gap.component.html',
  styleUrl: './skill-gap.component.scss',
})
export class SkillGapComponent implements OnInit {
  private api = inject(SkillGapService);
  data = signal<SkillGap | null>(null);
  scope = signal<'field' | 'all'>('field');
  title = '';
  loading = signal(true);
  error = signal('');
  showAll = signal(false);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.market(this.scope(), this.title).subscribe({
      next: d => { this.data.set(d); this.loading.set(false); this.error.set(''); },
      error: () => { this.loading.set(false); this.error.set('Cannot reach the API. Is job-sarthi-api running on port 5000?'); },
    });
  }

  setScope(s: 'field' | 'all') { this.scope.set(s); this.load(); }

  /** Percent of the top skills you cover, for the headline. */
  coverage(d: SkillGap) { return d.topN === 0 ? 0 : Math.round(d.topHave * 100 / d.topN); }
  rows(d: SkillGap) { return this.showAll() ? d.skills : d.skills.slice(0, 20); }
  /** Bar width: relative to the most requested skill, so small differences stay visible. */
  width(d: SkillGap, percent: number) { const max = d.skills[0]?.percent || 1; return Math.max(2, Math.round(percent * 100 / max)); }
}
