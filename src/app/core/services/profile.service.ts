import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl + '/profile';

  get() { return this.http.get<UserProfile>(this.base); }
  save(p: UserProfile) { return this.http.put<void>(this.base, p); }
  upload(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<UserProfile>(this.base + '/resume', form);
  }
}
