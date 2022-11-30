import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Member } from '../members/interfaces/member';
import { environment } from './../../environments/environment';

@Injectable()
export class AuthService {
  apiUrl: string;
  isAuthenticated: boolean;
  currentMember: Member = null;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.apiUrl}${environment.apiPath}/members`;
    this.isAuthenticated = false;
  }

  private loggedIn = new BehaviorSubject<boolean>(false);

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  login(memberId: number): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/${memberId}`).pipe(
      tap((res) => {
        this.isAuthenticated = res !== null;
        this.currentMember = res;
        this.loggedIn.next(true);
      })
    );
  }

  logout(): void {
    this.isAuthenticated = false;
    this.currentMember = null;
    this.loggedIn.next(false);
  }
}
