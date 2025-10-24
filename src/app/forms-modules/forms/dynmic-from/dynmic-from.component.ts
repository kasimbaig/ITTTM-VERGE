import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
@Component({
  selector: 'app-dynmic-from',
  imports: [],
  templateUrl: './dynmic-from.component.html',
  styleUrl: './dynmic-from.component.scss'
})
export class DynmicFromComponent implements OnInit {
  getFromlocal:any;
  constructor(private apiService: ApiService) {}
  ngOnInit(): void {
   this.getFromlocal = localStorage.getItem('form_data');
   console.log(this.getFromlocal);
   const previewWindow = window.open('', '_blank', 'width=2000,height=800');
   if (previewWindow) {
     previewWindow.document.write(this.getFromlocal);
     previewWindow.document.close();
   }
  }

}
