import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { MessageService } from 'primeng/api';



@Component({
  selector: 'app-attech-sfd-by-refrence',
  standalone: false,
  templateUrl: './attech-sfd-by-refrence.component.html',
  styleUrl: './attech-sfd-by-refrence.component.css'
})
export class AttechSfdByRefrenceComponent implements OnInit {
  isChecked: boolean = false;
  displayDialog: boolean = false;
  sfdReferenceForm: FormGroup = new FormGroup({
    section: new FormControl(''),
    master_class: new FormControl(''),
    sfd_reference: new FormControl(''),
    apply_to: new FormControl('')
  });
  
  sectionOptions: any[] = [];
  classOptions: any[] = [];
  sfdReferenceOptions: any[] = [];
  applyToOptions: any[] = [];
  

  constructor(private apiService: ApiService, private toast: MessageService) {}

  ngOnInit(): void {
    this.apiCall();
  }

  apiCall(){
    this.apiService.get('/master/section/?is_dropdown=true').subscribe((res: any) => {
      this.sectionOptions = res;
    });
    this.apiService.get('/master/class/?is_dropdown=true').subscribe((res: any) => {
      this.classOptions = res;
    });
   
    this.apiService.get('/master/ship/?is_dropdown=true&is_apply=true').subscribe((res: any) => {
      this.applyToOptions = res;
    });
    
  }


  saveReference(): void {

    this.apiService.post('sfd/sfd-by-reference/', this.sfdReferenceForm.value).subscribe((res: any) => {
      //console.log(res);
      this.toast.add({severity:'success', summary: 'Success', detail: 'SFD Attached Successfully'});
    });

  }

  onClassChange(event: any): void {
    this.apiService.get(`sfd/distinct-ship-sfd/?is_dropdown=true&class_id=${event.value}&section_id=${this.sfdReferenceForm.value.section}`).subscribe((res: any) => {
      this.sfdReferenceOptions = res;
    });
  }

 
}
