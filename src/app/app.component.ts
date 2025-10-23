import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ndchsa-admin';
    // Add these properties to manage the chatbot's state
  isChatbotOpen: boolean = false;
  constructor(private router: Router) {}

  isLoginRoute(): boolean {
    return this.router.url === '/login';
  }

  isHomeRoute(): boolean {
    return this.router.url === '/home' || this.router.url === '/';
  }

  isAboutUsRoute(): boolean {
    return this.router.url === '/about-us';
  }

  isContactUsRoute(): boolean {
    return this.router.url === '/contact-us';
  }
  openChatbot() {
    this.isChatbotOpen = true;
  }

  closeChatbot(): void {
    this.isChatbotOpen = false;
  }

  minimizeChatbot(): void {
    this.isChatbotOpen = false; // For this simple example, we can treat minimize the same as close
  }
}
