// register.component.ts
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { SignalrService } from 'src/app/signalr.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private signalrService: SignalrService
  ) { }

  ngOnInit(): void {
    this.authService.registerListenerSuccess();
    this.authService.registerListenerFail();
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    this.authService.register(form.value.username, form.value.password);
    form.reset();
  }
}
