// Pridružuje korisnike u chat

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../chat/chat.service';

@Component({
  selector: 'app-join-room',
  templateUrl: './join-room.component.html',
  styleUrls: ['./join-room.component.css'],
})
export class JoinRoomComponent implements OnInit {
  joinRoomForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private chatService: ChatService
  ) {}

  // Inicijalizacija forme za pridruživanje sobi
  ngOnInit(): void {
    this.joinRoomForm = this.fb.group({
      room: ['', Validators.required], // Validacija za obavezno polje
    });
  }

  joinRoom() {
    const room = this.joinRoomForm.value.room;
    const user = sessionStorage.getItem('user');

    if (user && room) {
      // Postavljanje imena sobe u sessionStorage
      sessionStorage.setItem('room', room);
      // Pozivanje metode za pridruživanje sobi iz ChatService
      this.chatService
        .joinRoom(user, room)
        .then(() => {
          // Navigacija do chat komponente nakon uspešnog pridruživanja
          this.router.navigate(['chat']);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      console.error('User or room is missing');
    }
  }
}
