import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ALL_MODES, Rule, WorkMode } from '../../core/models/rule.model';
import { RulesService } from '../../core/services/rules.service';
import { ProfileService } from '../../core/services/profile.service';
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
  allModes = ALL_MODES;

  private toggled(list: WorkMode[], m: WorkMode): WorkMode[] {
    const next = list.includes(m) ? list.filter(x => x !== m) : [...list, m];
    return ALL_MODES.filter(x => next.includes(x)); // keep Remote, Hybrid, Onsite order
  }
  togglePlaceMode(i: number, m: WorkMode) {
    const r = this.rule();
    if (!r) return;
    this.patch({ locationPrefs: r.locationPrefs.map((p, idx) => (idx === i ? { ...p, modes: this.toggled(p.modes, m) } : p)) });
  }
  toggleOther(m: WorkMode) {
    const r = this.rule();
    if (r) this.patch({ otherModes: this.toggled(r.otherModes, m) });
  }
  removePlace(i: number) {
    const r = this.rule();
    if (r) this.patch({ locationPrefs: r.locationPrefs.filter((_, idx) => idx !== i) });
  }
  addPlace(box: HTMLInputElement) {
    const r = this.rule();
    const place = box.value.trim();
    if (!r || !place) return;
    if (r.locationPrefs.some(p => p.place.toLowerCase() === place.toLowerCase())) { box.value = ''; return; }
    // A new place starts with every mode ticked. Untick what you do not want there.
    this.patch({ locationPrefs: [...r.locationPrefs, { place, modes: [...ALL_MODES] }] });
    box.value = '';
  }
  msg = signal('');
  error = signal('');
  saving = signal(false);

  private profileApi = inject(ProfileService);
  profileSkills = signal<string[]>([]);
  copied = signal('');

  // Skills that nearly every tech posting mentions. Copying them would only inflate the keyword score.
  private static readonly COMMON = new Set(['html', 'css', 'scss', 'git', 'agile', 'scrum', 'oop', 'solid', 'design patterns',
    'rest apis', 'unit testing', 'tdd', 'ci/cd', 'jwt', 'oauth']);

  ngOnInit() {
    this.api.get().subscribe({
      next: r => this.rule.set(r),
      error: () => this.error.set('Cannot reach the API. Is job-sarthi-api running on port 5000?'),
    });
    this.profileApi.get().subscribe({ next: p => this.profileSkills.set(p.skills), error: () => {} });
  }

  /** Adds your profile skills to Keywords, skipping ones already there and the very common ones. Not saved until you press Save rules. */
  copySkills() {
    const r = this.rule();
    if (!r) return;
    const have = new Set(r.keywords.map(k => k.toLowerCase()));
    const add = this.profileSkills().filter(s => !RulesComponent.COMMON.has(s.toLowerCase()) && !have.has(s.toLowerCase()));
    this.patch({ keywords: [...r.keywords, ...add] });
    this.copied.set(add.length > 0 ? `Added ${add.length} skill${add.length === 1 ? '' : 's'}. Press Save rules to apply.` : 'All your skills are already in Keywords.');
    setTimeout(() => this.copied.set(''), 5000);
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
