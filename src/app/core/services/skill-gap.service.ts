import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SkillGap } from '../models/skill-gap.model';

@Injectable({ providedIn: 'root' })
export class SkillGapService {
  private http = inject(HttpClient);

  /** scope 'field' = jobs that mention at least one of your skills, 'all' = every fetched job. title keeps only matching titles. */
  market(scope: 'field' | 'all', title: string) {
    let params = new HttpParams().set('scope', scope);
    if (title.trim()) params = params.set('title', title.trim());
    return this.http.get<SkillGap>(environment.apiBaseUrl + '/skills/market', { params });
  }
}
