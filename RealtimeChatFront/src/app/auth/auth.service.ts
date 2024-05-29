import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SignalrService } from './../signalr.service';
import { User } from './../signalr.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public authStatus = new EventEmitter<boolean>();

  constructor(public signalrService: SignalrService, public router: Router) {
    let tempPersonId = localStorage.getItem('personId');
    if (tempPersonId) {
      this.isAuthenticated = true;
      this.authStatus.emit(true);
      if (this.signalrService.hubConnection?.state === 1) {
        this.reauthMeListener();
        this.reauthMe(tempPersonId);
      } else {
        this.signalrService.ssObs().subscribe((obj: any) => {
          if (obj.type === 'HubConnStarted') {
            this.reauthMeListener();
            this.reauthMe(tempPersonId);
          }
        });
      }
    } else {
      this.authStatus.emit(false);
    }
  }

  async register(username: string, password: string) {
    let personInfo = { username, password };
    await this.signalrService.hubConnection
      .invoke('RegisterUser', personInfo)
      .catch((err) => console.error(err));
  }

  registerListenerSuccess() {
    this.signalrService.hubConnection.on(
      'registerResponseSuccess',
      (user: User) => {
        this.signalrService.userData = { ...user };
        this.isAuthenticated = true;
        this.authStatus.emit(true);
        this.signalrService.toastr.success('Registration successful!');
        this.router.navigateByUrl('/home');
      }
    );
  }

  registerListenerFail() {
    this.signalrService.hubConnection.on(
      'registerResponseFail',
      (message: string) => {
        this.signalrService.toastr.error(message);
      }
    );
  }

  public isAuthenticated: boolean = false;

  async authMe(person: string, pass: string) {
    let personInfo = { userName: person, password: pass };

    await this.signalrService.hubConnection
      .invoke('AuthenticateUser', personInfo)
      .catch((err) => console.error(err));
  }

  authMeListenerSuccess() {
    this.signalrService.hubConnection.on(
      'authMeResponseSuccess',
      (user: User) => {
        this.signalrService.userData = { ...user };
        localStorage.setItem('personId', user.id);
        sessionStorage.setItem('user', user.username); // Set the username in session storage
        this.isAuthenticated = true;
        this.authStatus.emit(true);
        this.signalrService.toastr.success('Login successful!');
        this.signalrService.router.navigateByUrl('/home');
      }
    );
  }

  authMeListenerFail() {
    this.signalrService.hubConnection.on('authMeResponseFail', () => {
      this.signalrService.toastr.error('Wrong credentials!');
    });
  }

  async reauthMe(personId: string) {
    await this.signalrService.hubConnection
      .invoke('ReauthenticateUser', personId)
      .catch((err) => console.error(err));
  }

  reauthMeListener() {
    this.signalrService.hubConnection.on('reauthMeResponse', (user: User) => {
      this.signalrService.userData = { ...user };
      this.isAuthenticated = true;
      this.authStatus.emit(true);
      if (this.signalrService.router.url === '/auth')
        this.signalrService.router.navigateByUrl('/home');
    });
  }

  async logOut() {
    const personId = localStorage.getItem('personId');
    if (personId) {
      await this.signalrService.hubConnection
        .invoke('LogoutUser', personId)
        .catch((err) => console.error(err));
      localStorage.removeItem('personId');
      sessionStorage.removeItem('user');
      this.isAuthenticated = false;
      this.authStatus.emit(false);
      this.router.navigateByUrl('/auth');
    }
  }
}
