import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot-dialog',
  standalone: false,
  templateUrl: './chatbot-dialog.component.html',
  styleUrls: ['./chatbot-dialog.component.css']
})
export class ChatbotDialogComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  // Use @Output to emit an event when the user wants to close the dialog
  @Output() closeDialog = new EventEmitter<void>();
  @Output() minimizeDialog = new EventEmitter<void>();

  chatMessages: { text: string; fromUser: boolean; isSuggestion?: boolean; isSuggestionHeader?: boolean; }[] = [];
  userMessage: string = '';
  isBotTyping: boolean = false;

  // This static variable will persist chat history even when the dialog is closed.
  static chatHistory: { text: string; fromUser: boolean; isSuggestion?: boolean; isSuggestionHeader?: boolean; }[] = [];

  constructor(private api: ApiService) { }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnInit() {
    this.chatMessages = ChatbotDialogComponent.chatHistory;
  }

  get hasSuggestions(): boolean {
    return this.chatMessages.some(msg => msg.isSuggestion);
  }

  formatMessage(message: string): string {
    return message.replace(
      /(https?:\/\/[^\s]+)/g,
      (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );
  }

  sendMessage() {
    if (this.userMessage.trim()) {
      const payload = { query: this.userMessage };
      this.chatMessages.push({ text: this.userMessage, fromUser: true });
      this.userMessage = '';
      this.isBotTyping = true;

      this.api.post<any>('qa/chat/', payload).subscribe(
        (res) => {
          this.chatMessages.push({ text: res.answer, fromUser: false });
          this.chatMessages = this.chatMessages.filter(msg => !msg.isSuggestion && !msg.isSuggestionHeader);

          if (res.similar_questions && res.similar_questions.length > 0) {
            this.chatMessages.push({
              text: "Did you mean?",
              fromUser: false,
              isSuggestionHeader: true
            });

            res.similar_questions.forEach((question: string) => {
              this.chatMessages.push({
                text: question,
                fromUser: false,
                isSuggestion: true
              });
            });
          }

          this.isBotTyping = false;
        },
        (err) => {
          this.chatMessages.push({ text: 'Oops! Something went wrong.', fromUser: false });
          this.isBotTyping = false;
        }
      );
    }
  }

  scrollToBottom() {
    if (this.chatContainer) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }

  selectSuggestion(suggestion: string) {
    this.userMessage = suggestion;
    this.sendMessage();
  }

  closeChatbot() {
    ChatbotDialogComponent.chatHistory = [];
    this.closeDialog.emit(); // Emit event to the parent
  }

  minimizeChatbot() {
    ChatbotDialogComponent.chatHistory = this.chatMessages;
    this.minimizeDialog.emit(); // Emit event to the parent
  }
}