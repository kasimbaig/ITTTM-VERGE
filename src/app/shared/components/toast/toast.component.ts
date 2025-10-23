import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  message = '';
  type: 'success' | 'error' = 'success';
  show = false;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toastState$.subscribe(({ message, type }) => {
      this.message = message;
      this.type = type;
      this.show = true;

      setTimeout(() => {
        this.show = false;
      }, 3000);
    });
  }
}
