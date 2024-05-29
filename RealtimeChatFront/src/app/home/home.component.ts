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
    this.userOnLis();
    this.userOffLis();
    this.logOutLis();
    this.getOnlineUsersLis();
    this.sendMsgLis();

    // Ensure the SignalR connection is established
    if (this.signalrService.hubConnection.state == 1) {
      this.getOnlineUsersInv();
    } else {
      this.signalrService.hubConnection.on('HubConnStarted', () => {
        this.getOnlineUsersInv();
      });
    }
  }

  logOut(): void {
    this.signalrService.hubConnection
      .invoke('LogoutUser', this.signalrService.userData.id)
      .catch((err) => console.error(err));
  }

  logOutLis(): void {
    this.signalrService.hubConnection.on('logoutResponse', () => {
      localStorage.removeItem('personId');
      location.reload();
    });
  }

  userOnLis(): void {
    this.signalrService.hubConnection.on('userOn', (newUser: User) => {
      // // console.log("User logged on:", newUser);
      this.users.push(newUser);
    });
  }

  userOffLis(): void {
    this.signalrService.hubConnection.on('userOff', (personId: string) => {
      // // console.log("User logged off:", personId);
      this.users = this.users.filter((u) => u.id !== personId);
    });
  }

  getOnlineUsersInv(): void {
    this.signalrService.hubConnection
      .invoke('getOnlineUsers')
      .catch((err) => console.error(err));
  }

  private getOnlineUsersLis(): void {
    this.signalrService.hubConnection.on(
      'getOnlineUsersResponse',
      (onlineUsers: Array<User>) => {
        this.users = onlineUsers;
        // // console.log("Online users received:", this.users);
      }
    );
  }

  sendMsgInv(): void {
    if (this.msg?.trim() === '' || this.msg == null) return;

    this.signalrService.hubConnection
      .invoke('sendMsg', this.selectedUser.connId, this.msg)
      .catch((err) => console.error(err));

    if (this.selectedUser.msgs == null) this.selectedUser.msgs = [];
    this.selectedUser.msgs.push(new Message(this.msg, true));
    this.msg = '';
  }

  private sendMsgLis(): void {
    this.signalrService.hubConnection.on(
      'sendMsgResponse',
      (connId: string, msg: string) => {
        let receiver = this.users.find((u) => u.connId === connId);
        if (receiver.msgs == null) receiver.msgs = [];
        receiver.msgs.push(new Message(msg, false));
      }
    );
  }
}
