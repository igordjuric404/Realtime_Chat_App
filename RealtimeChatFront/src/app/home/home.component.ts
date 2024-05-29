// Upravlja korisnicima koji su online i slanjem poruka preko SignalR-a

import { Message, User } from './../signalr.service';
import { SignalrService } from 'src/app/signalr.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(public signalrService: SignalrService) {}

  // Variables
  users: Array<User> = [];
  selectedUser: User;
  msg: string;

  ngOnInit(): void {
    // Postavljanje slušaoca za različite događaje
    this.userOnLis();
    this.userOffLis();
    this.logOutLis();
    this.getOnlineUsersLis();
    this.sendMsgLis();

    // Osiguravanje da je konekcija sa SignalR uspostavljena pre nego što se zatraže online korisnici
    if (this.signalrService.hubConnection.state == 1) {
      this.getOnlineUsersInv();
    } else {
      this.signalrService.hubConnection.on('HubConnStarted', () => {
        this.getOnlineUsersInv();
      });
    }
  }

  logOut(): void {
    // Slanje zahteva za odjavljivanje korisnika
    this.signalrService.hubConnection
      .invoke('LogoutUser', this.signalrService.userData.id)
      .catch((err) => console.error(err));
  }

  logOutLis(): void {
    // Slušalac za odgovor na odjavljivanje korisnika
    this.signalrService.hubConnection.on('logoutResponse', () => {
      localStorage.removeItem('personId');
      location.reload();
    });
  }

  userOnLis(): void {
    // Slušalac za povezivanje novih korisnika
    this.signalrService.hubConnection.on('userOn', (newUser: User) => {
      this.users.push(newUser);
    });
  }

  userOffLis(): void {
    // Slušalac za odjavljivanje korisnika
    this.signalrService.hubConnection.on('userOff', (personId: string) => {
      this.users = this.users.filter((u) => u.id !== personId);
    });
  }

  getOnlineUsersInv(): void {
    // Slanje zahteva za dobijanje liste online korisnika
    this.signalrService.hubConnection
      .invoke('getOnlineUsers')
      .catch((err) => console.error(err));
  }

  private getOnlineUsersLis(): void {
    // Slušalac za odgovor sa listom online korisnika
    this.signalrService.hubConnection.on(
      'getOnlineUsersResponse',
      (onlineUsers: Array<User>) => {
        this.users = onlineUsers;
      }
    );
  }

  sendMsgInv(): void {
    // Provera da li je poruka validna pre slanja
    if (this.msg?.trim() === '' || this.msg == null) return;

    // Slanje poruke korisniku
    this.signalrService.hubConnection
      .invoke('sendMsg', this.selectedUser.connId, this.msg)
      .catch((err) => console.error(err));

    // Dodavanje poruke u lokalnu listu poruka korisnika
    if (this.selectedUser.msgs == null) this.selectedUser.msgs = [];
    this.selectedUser.msgs.push(new Message(this.msg, true));
    this.msg = '';
  }

  private sendMsgLis(): void {
    // Slušalac za odgovor na poslatu poruku
    this.signalrService.hubConnection.on(
      'sendMsgResponse',
      (connId: string, msg: string) => {
        // Pronalaženje korisnika koji je primio poruku koristeći connId
        let receiver = this.users.find((u) => u.connId === connId);
        // Provera da li lista poruka za korisnika postoji, ako ne postoji, kreira se nova lista
        if (receiver.msgs == null) receiver.msgs = [];
        // Dodavanje primljene poruke u listu poruka korisnika
        receiver.msgs.push(new Message(msg, false));
      }
    );
  }
}
