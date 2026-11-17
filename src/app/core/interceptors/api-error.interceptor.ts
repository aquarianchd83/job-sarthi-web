import { HttpInterceptorFn } from '@angular/common/http';

// MOCK - stage 1: surface API errors as toasts.
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => next(req);
