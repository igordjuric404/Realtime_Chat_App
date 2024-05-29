// Upravlja autentifikacijom korisnika korišćenjem SignalR-a
import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SignalrService } from './../signalr.service';
import { User } from './../signalr.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public authStatus = new EventEmitter<boolean>();

  constructor(public signalrService: SignalrService, public router: Router) {
    // Provera da li postoji personId u localStorage za automatsku autentifikaciju
    let tempPersonId = localStorage.getItem('personId');
    if (tempPersonId) {
      this.isAuthenticated = true;
      this.authStatus.emit(true);

      // Provera stanja SignalR konekcije i pozivanje ponovne autentifikacije ako je konekcija aktivna
      if (this.signalrService.hubConnection?.state === 1) {
        this.reauthMeListener();
        this.reauthMe(tempPersonId);
      } else {
        // Pretplata na događaje kada se SignalR konekcija uspostavi
        // Kada se dogodi događaj 'HubConnStarted', izvršavaju se reauthMeListener i reauthMe sa tempPersonId
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

  // Metoda za registraciju korisnika
  async register(username: string, password: string) {
    let personInfo = { username, password };
    // Poziv SignalR metode za registraciju korisnika
    await this.signalrService.hubConnection
      .invoke('RegisterUser', personInfo)
      .catch((err) => console.error(err)); // Hvatanje i ispisivanje greške ako postoji
  }

  // Postavljanje slušaoca za uspešnu registraciju
  registerListenerSuccess() {
    this.signalrService.hubConnection.on(
      'registerResponseSuccess',
      (user: User) => {
        // Čuvanje korisničkih podataka i ažuriranje statusa autentifikacije
        this.signalrService.userData = { ...user };
        this.isAuthenticated = true;
        this.authStatus.emit(true);
        this.signalrService.toastr.success('Registration successful!');
        this.router.navigateByUrl('/home'); // Preusmeravanje na početnu stranicu
      }
    );
  }

  // Postavljanje slušaoca za neuspešnu registraciju
  registerListenerFail() {
    this.signalrService.hubConnection.on(
      'registerResponseFail',
      (message: string) => {
        this.signalrService.toastr.error(message); // Ispisivanje greške o neuspešnoj registraciji
      }
    );
  }

  public isAuthenticated: boolean = false;

  // Metoda za autentifikaciju korisnika
  async authMe(person: string, pass: string) {
    let personInfo = { userName: person, password: pass };
    // Poziv SignalR metode za autentifikaciju korisnika
    await this.signalrService.hubConnection
      .invoke('AuthenticateUser', personInfo)
      .catch((err) => console.error(err)); // Hvatanje i ispisivanje greške ako postoji
  }

  // Postavljanje slušaoca za uspešnu autentifikaciju
  authMeListenerSuccess() {
    this.signalrService.hubConnection.on(
      'authMeResponseSuccess',
      (user: User) => {
        // Čuvanje korisničkih podataka i ažuriranje statusa autentifikacije
        this.signalrService.userData = { ...user };
        localStorage.setItem('personId', user.id);
        sessionStorage.setItem('user', user.username); // Čuvanje korisničkog imena u sesiji
        this.isAuthenticated = true;
        this.authStatus.emit(true);
        this.signalrService.toastr.success('Login successful!');
        this.signalrService.router.navigateByUrl('/home'); // Preusmeravanje na početnu stranicu
      }
    );
  }

  // Postavljanje slušaoca za neuspešnu autentifikaciju
  authMeListenerFail() {
    this.signalrService.hubConnection.on('authMeResponseFail', () => {
      this.signalrService.toastr.error('Wrong credentials!'); // Ispisivanje greške o pogrešnim kredencijalima
    });
  }

  // Metoda za ponovnu autentifikaciju korisnika
  async reauthMe(personId: string) {
    // Poziv SignalR metode za ponovnu autentifikaciju korisnika
    await this.signalrService.hubConnection
      .invoke('ReauthenticateUser', personId)
      .catch((err) => console.error(err)); // Hvatanje i ispisivanje greške ako postoji
  }

  // Postavljanje slušaoca za odgovor na ponovnu autentifikaciju
  reauthMeListener() {
    this.signalrService.hubConnection.on('reauthMeResponse', (user: User) => {
      // Ažuriranje korisničkih podataka i statusa autentifikacije
      this.signalrService.userData = { ...user };
      this.isAuthenticated = true;
      this.authStatus.emit(true);
      // Ako je trenutna ruta stranica za autentifikaciju, preusmerava na početnu stranicu
      if (this.signalrService.router.url === '/auth')
        this.signalrService.router.navigateByUrl('/home');
    });
  }

  // Metoda za odjavljivanje korisnika
  async logOut() {
    const personId = localStorage.getItem('personId');
    if (personId) {
      // Poziv SignalR metode za odjavljivanje korisnika
      await this.signalrService.hubConnection
        .invoke('LogoutUser', personId)
        .catch((err) => console.error(err)); // Hvatanje i ispisivanje greške ako postoji
      localStorage.removeItem('personId');
      sessionStorage.removeItem('user');
      this.isAuthenticated = false;
      this.authStatus.emit(false);
      this.router.navigateByUrl('/auth'); // Preusmeravanje na stranicu za autentifikaciju
    }
  }
}
