import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Rule, ScoringSummary } from '../models/rule.model';

@Injectable({ providedIn: 'root' })
export class RulesService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl + '/rules';

  get() { return this.http.get<Rule>(this.base); }
  /** Saving also re-filters every stored job and returns the new counts. */
  save(r: Rule) { return this.http.put<ScoringSummary>(this.base, r); }
}
