import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-sub-component-monthly',
 standalone:false,
  templateUrl: './sub-component-monthly.component.html',
  styleUrl: './sub-component-monthly.component.css'
})
export class SubComponentMonthlyComponent implements OnInit {
  Operation = [
    { id: 1,name: 'Ship Running Detail', icon: 'fa-ship', colorClass: 'text-red-500 bg-red-50 border-red-500 hover:bg-red-100 hover:text-red-600 border-red-700'},
    { id: 2,name: 'Boiler Steaming Detail', icon: 'fa-fire', colorClass: 'text-blue-500 bg-blue-600 -50 border-blue-500 hover:bg-blue-600 -100 hover:text-blue-600 border-blue-700'},
    { id: 3,name: 'Ship Activity', icon: 'fa-anchor', colorClass: 'text-green-500 bg-green-50 border-green-500 hover:bg-green-100 hover:text-green-600 border-green-700'},
    { id: 4,name: 'Fuel/AVCAT/Torsionmeter', icon: 'fa-gas-pump', colorClass: 'text-purple-500 bg-purple-50 border-purple-500 hover:bg-purple-100 hover:text-purple-600 border-purple-700'},
    { id: 5,name: 'ICCP/H2S Sensor/MFFS', icon: 'fa-shield-alt', colorClass: 'text-teal-500 bg-teal-50 border-teal-500 hover:bg-teal-100 hover:text-teal-600 border-teal-700'},
    { id: 6,name: 'Test Kits/Centrifuge', icon: 'fa-flask', colorClass: 'text-pink-500 bg-pink-50 border-pink-500 hover:bg-pink-100 hover:text-pink-600 border-pink-700'},
    { id: 7,name: 'Diesel Engine & SDC', icon: 'fa-bolt', colorClass: 'text-emerald-500 bg-emerald-50 border-emerald-500 hover:bg-emerald-100 hover:text-emerald-600 border-emerald-700'},
    { id: 8,name: 'DGUF', icon: 'fa-bolt', colorClass: 'text-cyan-500 bg-cyan-50 border-cyan-500 hover:bg-cyan-100 hover:text-cyan-600 border-cyan-700 '},
    { id: 9,name: 'Full Power Trials', icon: 'fa-bolt', colorClass: 'text-violet-500 bg-violet-50 border-violet-500 hover:bg-violet-100 hover:text-violet-600 border-violet-700'},
    { id: 10,name: 'G T Parameter', icon: 'fa-bolt', colorClass: 'text-rose-500 bg-rose-50 border-rose-500 hover:bg-rose-100 hover:text-rose-600 border-rose-700'},
    { id: 11,name: 'GT/RG Exploitation', icon: 'fa-oil-can', colorClass: 'text-lime-500 bg-lime-50 border-lime-500 hover:bg-lime-100 hover:text-lime-600 border-lime-700'},
    { id: 12,name: 'GTG Exploitation', icon: 'fa-wrench', colorClass: 'text-amber-500 bg-amber-50 border-amber-500 hover:bg-amber-100 hover:text-amber-600 border-amber-700'},
    { id: 13,name: 'GTG Parameter', icon: 'fa-comment-alt', colorClass: 'text-sky-500 bg-sky-50 border-sky-500 hover:bg-sky-100 hover:text-sky-600 border-sky-700'},
    { id: 14,name: 'Lubricant Consumption', icon: 'fa-calendar-check', colorClass: 'text-fuchsia-500 bg-fuchsia-50 border-fuchsia-500 hover:bg-fuchsia-100 hover:text-fuchsia-600 border-fuchsia-700'},
    { id: 15,name: 'R/H Extension', icon: 'fa-expand-arrows-alt', colorClass: 'text-indigo-500 bg-indigo-50 border-indigo-500 hover:bg-indigo-100 hover:text-indigo-600 border-indigo-700'},
    { id: 16,name: 'EO Remark', icon: 'fa-comment-dots', colorClass: 'text-emerald-500 bg-emerald-50 border-emerald-500 hover:bg-emerald-100 hover:text-emerald-600 border-emerald-700'},
    { id: 17,name: 'Equipment Next Roution Due', icon: 'fa-calendar-alt', colorClass: 'text-amber-500 bg-amber-50 border-amber-500 hover:bg-amber-100 hover:text-amber-600 border-amber-700'},
    { id: 18,name: 'Final Page', icon: 'fa-file-alt', colorClass: 'text-green-500 bg-green-50 border-green-500 hover:bg-green-100 hover:text-green-600 border-green-700 '}
  ]
  activeOperation=this.Operation[0];
  srarEquipmentData: any[] = [];
  srarLocationsData: any[] = [];
  headerData:any;
  isLoading: boolean = false;
  loadingError: string = '';
  
  constructor(private apiService: ApiService) {}
  
  ngOnInit(): void {
    const data=this.apiService.getData();
    this.headerData=data;
    //console.log(this.headerData);
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.loadingError = '';
    
    // Load equipment data with error handling
    this.apiService.get('/sfd/sfd-details/?is_srar_equipment=True&ship='+this.headerData.ship_name?.id)
      .subscribe({
        next: (data) => {
          this.srarEquipmentData = data.results || [];
          //console.log('SRAR Equipment Data loaded:', this.srarEquipmentData.length, 'items');
          this.checkLoadingComplete();
        },
        error: (error) => {
          console.error('Error loading SRAR equipment data:', error);
          this.loadingError = 'Failed to load equipment data';
          this.isLoading = false;
        }
      });
    
    // Load locations data with error handling
    this.apiService.get('/master/locations/')
      .subscribe({
        next: (data) => {
          this.srarLocationsData = data.results || data || [];
          //console.log('SRAR Locations Data loaded:', this.srarLocationsData.length, 'items');
          this.checkLoadingComplete();
        },
        error: (error) => {
          console.error('Error loading locations data:', error);
          this.loadingError = 'Failed to load locations data';
          this.isLoading = false;
        }
      });
  }

  private checkLoadingComplete(): void {
    // Both arrays loaded, stop loading
    if (this.srarEquipmentData.length >= 0 && this.srarLocationsData.length >= 0) {
      this.isLoading = false;
      //console.log('All initial data loaded successfully');
    }
  }


  

  openOperation(operation: any) {
    //console.log(operation);
    this.activeOperation = operation;
  }
}