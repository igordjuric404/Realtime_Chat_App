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

  ngOnInit(): void {
    this.joinRoomForm = this.fb.group({
      room: ['', Validators.required],
    });
  }

  joinRoom() {
    const room = this.joinRoomForm.value.room;
    const user = sessionStorage.getItem('user'); // Retrieve the username from session storage

    if (user && room) {
      sessionStorage.setItem('room', room);
      this.chatService
        .joinRoom(user, room)
        .then(() => {
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
