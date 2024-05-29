// Upravlja konekcijom i komunikacijom sa SignalR serverom za chat

import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  public connection: signalR.HubConnection = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:5000/chat')
    .configureLogging(signalR.LogLevel.Information)
    .build();

  public messages$ = new BehaviorSubject<any>([]);
  public connectedUsers$ = new BehaviorSubject<string[]>([]);
  public messages: any[] = [];
  public users: string[] = [];

  constructor() {
    // Pokretanje konekcije i postavljanje slušaoca za poruke i povezane korisnike
    this.start();
    this.connection.on(
      'ReceiveMessage',
      (user: string, message: string, messageTime: string) => {
        this.messages = [...this.messages, { user, message, messageTime }];
        this.messages$.next(this.messages);
      }
    );

    this.connection.on('ConnectedUser', (users: any) => {
      this.connectedUsers$.next(users);
    });
  }

  public async start() {
    // Pokretanje konekcije sa SignalR serverom
    try {
      await this.connection.start();
    } catch (error) {
      console.log(error);
    }
  }

  public async joinRoom(user: string, room: string) {
    // Pridruživanje korisnika sobi
    return this.connection.invoke('JoinRoom', { user, room });
  }

  public async sendMessage(message: string) {
    // Slanje poruke serveru
    return this.connection.invoke('SendMessage', message);
  }

  public async leaveChat() {
    // Odjavljivanje iz chata
    return this.connection.stop();
  }
}
