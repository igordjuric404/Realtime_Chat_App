// Upravlja stanjem autentifikacije i omogućava odjavu korisnika

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service'; // Adjust the path based on your directory structure

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isAuthenticated: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Postavljanje početnog stanja autentifikacije
    this.isAuthenticated = !!sessionStorage.getItem('user');
    // Pretplata na promene stanja autentifikacije
    this.authService.authStatus.subscribe((status) => {
      this.isAuthenticated = status;
    });
  }

  logOut(): void {
    // Odjavljivanje korisnika
    this.authService.logOut();
  }
}
