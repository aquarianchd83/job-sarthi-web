import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserProfile } from '../../core/models/profile.model';
import { ProfileService } from '../../core/services/profile.service';
import { ChipInputComponent } from '../../shared/components/chip-input/chip-input.component';
import { IstDatePipe } from '../../shared/pipes/ist-date.pipe';

@Component({
  selector: 'app-resume-profile',
  standalone: true,
  imports: [FormsModule, ChipInputComponent, IstDatePipe],
  templateUrl: './resume-profile.component.html',
  styleUrl: './resume-profile.component.scss',
})
export class ResumeProfileComponent implements OnInit {
  private api = inject(ProfileService);
  p = signal<UserProfile | null>(null);
  msg = signal('');
  error = signal('');
  uploading = signal(false);

  ngOnInit() {
    this.api.get().subscribe({
      next: v => this.p.set(v),
      error: () => this.error.set('Cannot reach the API. Is job-sarthi-api running on port 5000?'),
    });
  }

  patch(x: Partial<UserProfile>) { this.p.update(v => (v ? { ...v, ...x } : v)); }

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.upload(file);
    input.value = '';
  }

  onDrop(ev: DragEvent) {
    ev.preventDefault();
    const file = ev.dataTransfer?.files?.[0];
    if (file) this.upload(file);
  }

  private upload(file: File) {
    this.uploading.set(true);
    this.error.set('');
    this.api.upload(file).subscribe({
      next: v => { this.p.set(v); this.uploading.set(false); this.flash('Resume read. Check the fields below, then save.'); },
      error: e => { this.uploading.set(false); this.error.set(typeof e.error === 'string' ? e.error : 'Upload failed.'); },
    });
  }

  save() {
    const v = this.p();
    if (!v) return;
    this.api.save(v).subscribe({
      next: () => this.flash('Profile saved'),
      error: () => this.error.set('Could not save profile.'),
    });
  }

  private flash(m: string) { this.msg.set(m); setTimeout(() => this.msg.set(''), 3500); }
}
