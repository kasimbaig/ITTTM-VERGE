import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../../../../../services/api.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-ship-running-detail',
  standalone: false,
  templateUrl: './ship-running-detail.component.html',
  styleUrl: './ship-running-detail.component.css',
})
export class ShipRunningDetailComponent implements OnInit {
  
  isEdit: boolean = false;
  @Input() srarEquipmentData: any[] = [];
  
  equipmentExploitationData:any[]=[]
  // Properties to track selected values for equipment
  selectedEquipment: any[] = [];
  item={
    ship:null,
    srar_month:null,
    srar_year:null,
    hours_underway_month:null,
    distance_run_month:null,
    hours_underway_since_commissioning:null,
    distance_run_since_commissioning:null,
    max_speed:null,
    max_duration:null,
    
  };
  headerData: any;
  shipRunningData: any;
  constructor(private router: Router, private apiService: ApiService,private messageService: MessageService) {}
  
  ngOnInit() {
    this.headerData = this.apiService.getData();
    //console.log(this.headerData);
    this.getEquipmentExploitationData();
  }

  getEquipmentExploitationData(){
      this.apiService.get(`srar/srar-monthly-equipments/?srar_monthly_header=${this.headerData.id}`).subscribe({
      next: (res:any) => {
        this.equipmentExploitationData=res.results;
      }
    })
      this.apiService.get(`srar/srar-monthly-headers/${this.headerData.id}/`).subscribe({
      next: (res:any) => {
        this.item=res;
      }
    })
  }

  saveShipRunning(){
    this.item.ship=this.headerData.ship_name?.id;
    this.item.srar_month=this.headerData.month?.value;
    this.item.srar_year=this.headerData.year?.value;

    this.apiService.post('srar/srar-monthly-headers/',this.item).subscribe({
      next: (res:any) => {
        this.messageService.add({severity:'success', summary:'Success', detail:'Ship Running Details Saved Successfully'});
        this.headerData.id=res.id;
        this.apiService.setData(this.headerData);
      },
      error: (error) => {
        this.messageService.add({severity:'error', summary:'Error', detail:'Failed to save Ship Running Details'});
        console.error('Error saving ship running details:', error);
      }
    }
  )
    //console.log(this.item);
  }


  addEquipmentExploitation(){
    this.selectedEquipment.forEach((item:any)=>{
    this.equipmentExploitationData.push({
        sfd_details:item.id,
        srar_monthly_header:this.headerData.id,
        equipment_name: item.equipment_name,
        equipment_code: item.equipment_code,
        location: item.location_code,
        nomenclature: item.nomenclature,
        serial_no: item.serial_no,
        hours_for_a_month: null,
        hours_from_installation: null
      })
    })  
   
  }
  editEquipmentExploitation(){

  }

  saveEquipmentExploitation(){
   this.equipmentExploitationData.forEach((item:any)=>{
    this.apiService.post('srar/srar-monthly-equipments/',item).subscribe({
      next: (res:any) => {
        this.messageService.add({severity:'success', summary:'Success', detail:res.message || 'Equipment Exploitation Saved Successfully'});
        this.getEquipmentExploitationData();
      },
      error: (error) => {
        this.messageService.add({severity:'error', summary:'Error', detail:error.message || 'Failed to save Equipment Exploitation'});
        console.error('Error saving equipment exploitation:', error);
      }
    })
   })
  }

}
