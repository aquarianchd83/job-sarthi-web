import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CategoryCounts, ClassifyResponse, Job, ShortlistStats } from '../models/job.model';
import { ScoringSummary } from '../models/rule.model';

@Injectable({ providedIn: 'root' })
export class ShortlistService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  getShortlist(take = 200) { return this.http.get<Job[]>(`${this.base}/shortlist?take=${take}`); }
  getStats() { return this.http.get<ShortlistStats>(`${this.base}/shortlist/stats`); }
  categories() { return this.http.get<CategoryCounts>(`${this.base}/jobs/categories`); }
  /** Re-sorts jobs into API / Email / Manual and opens the shortlist's apply pages to drop closed jobs. */
  classify(checkPages = true) { return this.http.post<ClassifyResponse>(`${this.base}/jobs/classify?checkPages=${checkPages}`, {}); }
  rescore() { return this.http.post<ScoringSummary>(`${this.base}/runs/score`, {}); }
}
