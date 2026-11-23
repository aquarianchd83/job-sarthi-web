import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApplicationDetail, ApplicationListItem } from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl + '/applications';

  list() { return this.http.get<ApplicationListItem[]>(this.base); }
  get(id: number) { return this.http.get<ApplicationDetail>(`${this.base}/${id}`); }
  /** Tailors if needed, then fills the form in the background. In approval mode it stops before submitting. */
  apply(jobId: number) { return this.http.post<ApplicationDetail>(`${this.base}/apply/${jobId}`, {}); }
  /** Email and Manual apply: tailor and get a draft ready. Never submits. */
  draft(jobId: number) { return this.http.post<ApplicationDetail>(`${this.base}/draft/${jobId}`, {}); }
  approve(id: number) { return this.http.post<ApplicationDetail>(`${this.base}/${id}/approve`, {}); }
  retry(id: number) { return this.http.post<ApplicationDetail>(`${this.base}/${id}/retry`, {}); }
  cancel(id: number) { return this.http.post<ApplicationDetail>(`${this.base}/${id}/reject`, {}); }
  manual(id: number) { return this.http.post<ApplicationDetail>(`${this.base}/${id}/manual`, {}); }
  markApplied(jobId: number) { return this.http.post<ApplicationDetail>(`${this.base}/mark-applied/${jobId}`, {}); }
  answer(id: number, questionId: number, answer: string, save: boolean) {
    return this.http.post<ApplicationDetail>(`${this.base}/${id}/answer`, { questionId, answer, save });
  }
  screenshotUrl(id: number, version: string) { return `${this.base}/${id}/screenshot?v=${encodeURIComponent(version)}`; }
}
