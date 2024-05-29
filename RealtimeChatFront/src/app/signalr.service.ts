// Upravlja konekcijom i razmenom poruka sa serverom

import { ToastrService } from 'ngx-toastr';
import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

export class User {
  public id: string;
  public username: string;
  public connId: string;
  public msgs: Array<Message>;
}

export class Message {
  constructor(public content: string, public mine: boolean) {}
}

@Injectable({ providedIn: 'root' })
export class SignalrService {
  constructor(public toastr: ToastrService, public router: Router) {}

  hubConnection: signalR.HubConnection;
  userData: User;

  // Subjekt za emitovanje SignalR događaja
  ssSubj = new Subject<any>();

  // Observable za slušanje SignalR događaja
  ssObs(): Observable<any> {
    return this.ssSubj.asObservable();
  }

  // Pokretanje SignalR konekcije
  startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5001/toastr', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build();

    // Početak SignalR konekcije
    this.hubConnection
      .start()
      .then(() => {
        // Emitovanje događaja nakon uspešnog pokretanja konekcije
        this.ssSubj.next({ type: 'HubConnStarted' });
      })
      .catch((err) => console.log('Error while starting connection: ' + err));
  };
}
