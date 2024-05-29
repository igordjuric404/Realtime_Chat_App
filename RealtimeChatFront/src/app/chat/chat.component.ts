// Upravlja funkcionalnostima za slanje poruka, praćenje novih poruka i odjavljivanje iz chata
import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatService } from './chat.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit, AfterViewChecked {
  // Polja za unos poruke, listu poruka, korisničko ime i ime sobe
  inputMessage = '';
  messages: any[] = [];
  loggedInUserName = sessionStorage.getItem('user');
  roomName = sessionStorage.getItem('room');

  // ViewChild za pristup elementu za scroll
  @ViewChild('scrollMe') private scrollContainer!: ElementRef;

  constructor(public chatService: ChatService, public router: Router) {}

  // Inicijalizacija komponente
  ngOnInit(): void {
    // Pretplata na observable za dobijanje novih poruka
    this.chatService.messages$.subscribe((res) => {
      this.messages = res;
    });

    // Pretplata na observable za dobijanje trenutno povezanih korisnika
    this.chatService.connectedUsers$.subscribe((res) => {});
  }

  // Metoda koja se poziva nakon što se komponenta ažurira
  ngAfterViewChecked(): void {
    // Postavljanje scrolla na dno kako bi se prikazale nove poruke
    this.scrollContainer.nativeElement.scrollTop =
      this.scrollContainer.nativeElement.scrollHeight;
  }

  // Metoda za slanje poruke
  sendMessage() {
    this.chatService
      .sendMessage(this.inputMessage)
      .then(() => {
        this.inputMessage = '';
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Metoda za napuštanje chata
  leaveChat() {
    this.chatService
      .leaveChat()
      .then(() => {
        // Preusmeravanje na početnu stranicu i osvežavanje
        this.router.navigate(['home']);
        setTimeout(() => {
          location.reload();
        }, 0);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Metoda za praćenje elemenata u listi poruka
  trackByFn(index: number, item: any): any {
    return item ? item.id : undefined;
  }
}
