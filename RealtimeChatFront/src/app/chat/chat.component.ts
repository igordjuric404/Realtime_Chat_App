import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatService } from './chat.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnInit, AfterViewChecked {

  inputMessage = "";
  messages: any[] = [];
  loggedInUserName = sessionStorage.getItem("user");
  roomName = sessionStorage.getItem("room");

  @ViewChild('scrollMe') private scrollContainer!: ElementRef;

  constructor(public chatService: ChatService, public router: Router) {}

  ngOnInit(): void {
    this.chatService.messages$.subscribe(res => {
      this.messages = res;
    });

    this.chatService.connectedUsers$.subscribe(res => {
    });
  }

  ngAfterViewChecked(): void {
    this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
  }

  sendMessage() {
    this.chatService.sendMessage(this.inputMessage)
      .then(() => {
        this.inputMessage = '';
      }).catch((err) => {
        console.log(err);
      });
  }

  leaveChat() {
    this.chatService.leaveChat()
      .then(() => {
        this.router.navigate(['home']);
        setTimeout(() => {
          location.reload();
        }, 0);
      }).catch((err) => {
        console.log(err);
      });
  }

  trackByFn(index: number, item: any): any {
    return item ? item.id : undefined;
  }
}
