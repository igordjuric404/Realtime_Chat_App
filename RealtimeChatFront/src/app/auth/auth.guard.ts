// Sprečava pristup određenim rutama ako korisnik nije autentifikovan

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Ako je korisnik autentifikovan, dozvoljava pristup ruti
    if (this.authService.isAuthenticated) {
      return true;
    } else {
      // Ako korisnik nije autentifikovan, preusmerava ga na stranicu za autentifikaciju
      this.router.navigateByUrl('auth');
      return false;
    }
  }
}
