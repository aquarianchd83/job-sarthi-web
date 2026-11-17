import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ChannelResult, ChannelStatus, TelegramChat } from '../models/app-settings.model';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl + '/notifications';

  status() { return this.http.get<ChannelStatus[]>(this.base + '/status'); }
  /** Sends a test message to every configured channel. */
  test() { return this.http.post<ChannelResult[]>(this.base + '/test', {}); }
  telegramChats() { return this.http.get<TelegramChat[]>(this.base + '/telegram/chats'); }
}
