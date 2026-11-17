import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EngineStatus, TailorResult } from '../models/tailor.model';

@Injectable({ providedIn: 'root' })
export class TailorService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl + '/tailor';

  /** 404 when this job has not been tailored yet. */
  get(jobId: number) { return this.http.get<TailorResult>(`${this.base}/${jobId}`); }
  run(jobId: number) { return this.http.post<TailorResult>(`${this.base}/${jobId}`, {}); }
  saveLetter(jobId: number, coverLetter: string) { return this.http.put<TailorResult>(`${this.base}/${jobId}`, { coverLetter }); }
  engines() { return this.http.get<EngineStatus[]>(`${this.base}/engines`); }
}
