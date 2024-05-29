// Upravlja formom za autentifikaciju korisnika. Koristi AuthService i SignalrService
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { SignalrService } from 'src/app/signalr.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private signalrService: SignalrService
  ) {}

  // Inicijalizacija komponente i postavljanje slušaoca za uspešnu i neuspešnu registraciju
  ngOnInit(): void {
    this.authService.registerListenerSuccess();
    this.authService.registerListenerFail();
  }

  // Metoda koja se poziva prilikom podnošenja forme za registraciju
  onSubmit(form: NgForm) {
    // Provera validnosti forme
    if (!form.valid) {
      return;
    }
    // Pozivanje metode za registraciju iz AuthService
    this.authService.register(form.value.username, form.value.password);
    // Resetovanje forme nakon podnošenja
    form.reset();
  }
}
