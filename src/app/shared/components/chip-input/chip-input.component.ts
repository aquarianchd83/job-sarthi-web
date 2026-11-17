import { Component, input, model } from '@angular/core';

/** Tag-style list editor: type a value, press Enter, click x to remove. */
@Component({
  selector: 'app-chip-input',
  standalone: true,
  template: `
    <div class="chips">
      @for (v of values(); track v) {
        <span class="chip" [class.bad]="danger()">{{ v }}<button type="button" (click)="remove(v)" [attr.aria-label]="'Remove ' + v">&times;</button></span>
      }
    </div>
    <input #box type="text" [placeholder]="placeholder()" [attr.aria-label]="label()" (keydown.enter)="add(box); $event.preventDefault()" (blur)="add(box)" />
  `,
  styles: [`
    :host { display: block; text-transform: none; letter-spacing: normal; font-weight: 400; color: #14181f; }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
    .chip { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; background: #f0f3f7; border: 1px solid #dde2e9; border-radius: 6px; padding: 3px 6px 3px 10px; }
    .chip.bad { background: #fde9e7; border-color: #f3c4c0; color: #8a1c14; }
    .chip button { border: 0; background: none; color: inherit; font-size: 14px; cursor: pointer; padding: 0 2px; }
    input { width: 100%; }
  `],
})
export class ChipInputComponent {
  label = input('');
  placeholder = input('Type and press Enter');
  danger = input(false);
  values = model<string[]>([]);

  add(box: HTMLInputElement) {
    const v = box.value.trim();
    if (v && !this.values().some(x => x.toLowerCase() === v.toLowerCase())) this.values.update(a => [...a, v]);
    box.value = '';
  }
  remove(v: string) { this.values.update(a => a.filter(x => x !== v)); }
}
