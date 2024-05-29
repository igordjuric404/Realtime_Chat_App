// Pokreće SignalR konekciju pri inicijalizaciji aplikacije i isključuje slušaoce prilikom gašenja

import { AuthService } from './auth/auth.service';
import { SignalrService } from './signalr.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    public signalrService: SignalrService,
    public authService: AuthService
  ) {}

  // Pokretanje SignalR konekcije prilikom inicijalizacije komponente
  ngOnInit() {
    this.signalrService.startConnection();
  }

  // Isključivanje slušalaca prilikom uništavanja komponente
  ngOnDestroy() {
    this.signalrService.hubConnection.off('askServerResponse');
  }
}
