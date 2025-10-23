// src/app/components/shared/modal/modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ModalComponent {
  @Input() title: string = 'Details';
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();

  /**
   * Closes the modal and emits the close event.
   */
  closeModal(): void {
    this.isVisible = false;
    this.close.emit();
  }
}

