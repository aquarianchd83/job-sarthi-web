import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Job, ShortlistStats } from '../models/job.model';
import { ScoringSummary } from '../models/rule.model';

@Injectable({ providedIn: 'root' })
export class ShortlistService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  getShortlist(take = 200) { return this.http.get<Job[]>(`${this.base}/shortlist?take=${take}`); }
  getStats() { return this.http.get<ShortlistStats>(`${this.base}/shortlist/stats`); }
  rescore() { return this.http.post<ScoringSummary>(`${this.base}/runs/score`, {}); }
}
