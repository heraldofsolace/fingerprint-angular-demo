import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;
  public url = 'http://localhost:3000';

  constructor(private http: HttpClient, private router: Router) {
    this.userSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('user')!));
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User | null {
    return this.userSubject.value;
  }

  login(email: string, password: string, request_id: string, visitor_id: string) {
    return this.http.post<User>(`${this.url}/login`, { email, password, request_id, visitor_id})
      .pipe(map(user => {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
        return user;
      }));
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  register(email: string, password: string, password_confirm: string, visitor_id: string) {
    return this.http.post(`${this.url}/register`, { email, password, password_confirm, visitor_id });
  }

  home() {
    return this.http.get<{ message: string, user: User }>(`${this.url}/home`, { headers: { Authorization: `Bearer ${this.userValue?.token}` }});
  }

  verify(visitor_id: string) {
    return this.http.post<{ verified: boolean }>(`${this.url}/verify`, { visitor_id }, { headers: { Authorization: `Bearer ${this.userValue?.token}` }});
  }
}
