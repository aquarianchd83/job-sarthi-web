import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MarketSkill, SkillGap } from '../../core/models/skill-gap.model';
import { SkillGapService } from '../../core/services/skill-gap.service';
import { ProfileService } from '../../core/services/profile.service';

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
  private profile = inject(ProfileService);
  /** Missing skills you ticked. Nothing is added until you confirm. */
  selected = signal<Set<string>>(new Set());
  confirming = signal(false);
  saving = signal(false);
  done = signal('');

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
  /** Missing skills first, then the ones you have. Each group stays in demand order (most requested first). */
  sorted(d: SkillGap) {
    const byDemand = (a: MarketSkill, b: MarketSkill) => b.percent - a.percent || b.jobs - a.jobs;
    return [...d.skills.filter(s => !s.have).sort(byDemand), ...d.skills.filter(s => s.have).sort(byDemand)];
  }
  rows(d: SkillGap) { const all = this.sorted(d); return this.showAll() ? all : all.slice(0, 20); }
  missingCount(d: SkillGap) { return d.skills.filter(s => !s.have).length; }

  isSelected(name: string) { return this.selected().has(name); }
  toggle(name: string) {
    const next = new Set(this.selected());
    next.has(name) ? next.delete(name) : next.add(name);
    this.selected.set(next);
    this.confirming.set(false);
    this.done.set('');
  }
  clear() { this.selected.set(new Set()); this.confirming.set(false); }
  selectedList() { return [...this.selected()]; }

  /** Adds the ticked skills to your profile (the skills list in Resume & Profile). Only after you confirm you have them. */
  addToResume() {
    const names = this.selectedList();
    if (names.length === 0) return;
    this.saving.set(true);
    this.profile.get().subscribe({
      next: p => {
        const have = new Set(p.skills.map(s => s.toLowerCase()));
        const skills = [...p.skills, ...names.filter(n => !have.has(n.toLowerCase()))];
        this.profile.save({ ...p, skills }).subscribe({
          next: () => {
            this.saving.set(false);
            this.done.set(`Added ${names.length} skill${names.length === 1 ? '' : 's'} to your profile: ${names.join(', ')}.`);
            this.clear();
            this.load();
          },
          error: () => { this.saving.set(false); this.error.set('Could not save your profile. Try again.'); },
        });
      },
      error: () => { this.saving.set(false); this.error.set('Could not read your profile. Try again.'); },
    });
  }
  /** Bar width: relative to the most requested skill, so small differences stay visible. */
  width(d: SkillGap, percent: number) { const max = d.skills[0]?.percent || 1; return Math.max(2, Math.round(percent * 100 / max)); }
}
