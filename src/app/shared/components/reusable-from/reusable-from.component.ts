import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-reusable-from',
  standalone: true,
  imports: [DialogModule],
  templateUrl: './reusable-from.component.html',
  styleUrl: './reusable-from.component.css',
})
export class ReusableFromComponent {
  @Input() visible: boolean = false;
  @Input() dialogWidth: string = '50vw';
  @Input() header: string = 'Dialog';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onSave() {
    this.save.emit();
    this.closeDialog();
  }

  onCancel() {
    this.cancel.emit();
    this.closeDialog();
  }

  private closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
