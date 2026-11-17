import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SavedAnswer } from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class SavedAnswersService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl + '/saved-answers';

  list() { return this.http.get<SavedAnswer[]>(this.base); }
  add(question: string, answer: string) { return this.http.post<SavedAnswer>(this.base, { question, answer }); }
  update(id: number, question: string, answer: string) { return this.http.put<void>(`${this.base}/${id}`, { question, answer }); }
  remove(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
