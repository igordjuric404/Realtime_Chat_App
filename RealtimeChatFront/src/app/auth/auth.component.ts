// Upravlja formom za registraciju korisnika. Koristi AuthService i SignalrService

import { AuthService } from './auth.service';
import { SignalrService } from './../signalr.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit, OnDestroy {
  constructor(
    public signalrService: SignalrService,
    public authService: AuthService
  ) {}

  // Inicijalizacija komponenti i postavljanje listener-a za uspešnu i neuspešnu autentifikaciju
  ngOnInit(): void {
    this.authService.authMeListenerSuccess();
    this.authService.authMeListenerFail();
  }

  // Uklanjanje slušaoca pri uništavanju komponente
  ngOnDestroy(): void {
    // Pozivanje metode za autentifikaciju iz SignalrService
    this.signalrService.hubConnection.off('authMeResponseSuccess');
    this.signalrService.hubConnection.off('authMeResponseFail');
  }

  // Metoda koja se poziva prilikom podnošenja forme za prijavu
  onSubmit(form: NgForm) {
    // Provera validnosti forme
    if (!form.valid) {
      return;
    }

    // Pozivanje metode za autentifikaciju iz AuthService
    this.authService.authMe(form.value.userName, form.value.password);
    // Resetovanje forme nakon podnošenja
    form.reset();
  }
}
