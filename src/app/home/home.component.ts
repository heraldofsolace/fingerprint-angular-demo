import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private message: string | undefined;

  constructor(private authService: AuthService) {}

  get getMessage() {
    return `The server says: ${this.message}`;
  }

  ngOnInit() {
    this.authService.home().subscribe({
      next: (data) => {
        this.message = data.message;
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
