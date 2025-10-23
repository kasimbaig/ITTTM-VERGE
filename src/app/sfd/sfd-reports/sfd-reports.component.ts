import {  Component,  OnInit,} from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
// import { HeaderColumn } from '../../interfaces/interfaces';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ReportComponent } from '../../srar/SARARTRANSACTION/sarar-monthly/sub-component-monthly/operations/report/report.component';
import { GenericTableData, HeaderColumn } from '../../srar/SARARTRANSACTION/sarar-monthly/sub-component-monthly/operations/report/equipment-table.interface';

@Component({
  selector: 'app-sfd-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DropdownModule, ReportComponent],
  templateUrl: './sfd-reports.component.html',
  styleUrl: './sfd-reports.component.css',
})
export class SfdReportsComponent implements OnInit {
  headerObject={
    // 1:equipmentRunningHoursHeader,
    // 2:boilerRunningHoursAndInspectionDetailsHeader,
    // 3:consumptionLubricantHeader,
    // 4:hoursUnderwayDistanceRunHeader,
    // 5:cumulativeShipActivityHeader,
    // 6:shipActivityDetailsHeader,
    // 7:eqptRhExtensionHeader,  
    // 8:overallActivityInPlatformsHeader,
    // 9:fuelConsumptionMonthWiseHeader,
    // 10:fuelConsumptionPropulsionWiseHeader,
    // 11:h2sSensorStatusHeader,
    // 12:srarAnualMonthReportHeader,
    // 13:srarAnualMonthReportHeader,
    // 14:srarGtgUtilisationHeader,
    // 15:srarAverageSpeedAnnualReportHeader ,
    // 16:fptCstReportHeader,
  }
  openFullScreenSararMonthly: boolean = false;
  reportName: any;
  shipOptions: any[] = [
    { name: 'Ship 1', value: 'ship1' },
  ];
  monthOptions: any[] = [
    { name: 'January', value: 'january' },
  ];
  yearOptions: any[] = [
    { name: '2024', value: '2024' },
  ];
  commandOptions: any[] = [
    { name: 'Command 1', value: 'command1' },
  ];
  classOptions: any[] = [
    { name: 'Class 1', value: 'class1' },
  ];
  equipmentOptions: any[] = [
    { name: 'Equipment 1', value: 'equipment1' },
  ];
  sectionOptions: any[] = [
    { name: 'Section 1', value: 'section1' },
  ];
  departmentOptions: any[] = [
    { name: 'Department 1', value: 'department1' },
  ];
  groupOptions: any[] = [ 
    { name: 'Group 1', value: 'group1' },
  ];
  genericOptions: any[] = [
    { name: 'Generic 1', value: 'generic1' },
  ];
  equipmentCodeOptions: any[] = [ 
    { name: 'Equipment Code 1', value: 'equipmentCode1' },
  ];
  equipmentDescriptionOptions: any[] = [
    { name: 'Equipment Description 1', value: 'equipmentDescription1' },
  ];
  shipStatusOptions: any[] = [
    { name: 'Ship Status 1', value: 'shipStatus1' },
  ];
  supplierOptions: any[] = [
    { name: 'Supplier 1', value: 'supplier1' },
  ];
  countryOptions: any[] = [
    { name: 'Country 1', value: 'country1' },
  ];
  providerOptions: any[] = [
    { name: 'Provider 1', value: 'provider1' },
  ];
  headerFrom: FormGroup = new FormGroup({
    'Ship': new FormControl(''),
    'Class': new FormControl(''),
      'Section': new FormControl(''),
      'Department': new FormControl(''),
      'Group': new FormControl(''),
      'Generic': new FormControl(''),
      'Equipment Code': new FormControl(''),
      'Equipment Description': new FormControl(''),
      'Equipment Name': new FormControl(''),
      'Equipment Model': new FormControl(''),
      'Specification Name': new FormControl(''),
      'Specification': new FormControl(''),
      'From Month': new FormControl(''),
      'To Month': new FormControl(''),
      'From Year': new FormControl(''),
      'To Year': new FormControl(''),
      'Command': new FormControl(''),
      'Ship Status': new FormControl(''),
      'Supplier': new FormControl(''),
      'Country': new FormControl(''),
      'Provider': new FormControl(''),
  });
  visibleObject={
    ship: false,
    section: false,
    department: false,
    group: false,
    generic: false,
    equipmentCode: false,
    equipmentDescription: false,
    equipmentName: false,
    equipmentModel: false,
    specificationName: false,
    fromMonth: false,
    toMonth: false,
    fromYear: false,
    toYear: false,
    command: false,
    shipStatus: false,
    supplier: false,
    country: false,
    provider: false,
    specificationCheckBox: false,
    equipmentInput: false,
    equipmentCodeInput: false,
    class: false,
  }

  reportHeader: HeaderColumn[][] = [];
  
  reportData:GenericTableData[] = [];
  constructor(public apiService: ApiService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.openFullScreenSararMonthly = true;
    this.reportName = this.apiService.getReportName();  
    this.reportHeader = this.headerObject[this.reportName.id as keyof typeof this.headerObject];
    this.checkVisibleObject(this.reportName.id);
    
    this.loadClassOptions();
    this.loadCommandOptions();
    this.loadShipOptions();
    this.loadEquipmentOptions();
  }

  redirectToSFD(subPath: string): void {
    this.openFullScreenSararMonthly = false;
    this.closeVisibleObject();
    this.router.navigate([subPath]);

  }
  isReportGenerating: boolean = false;
  viewReport(): void {
    //console.log(this.headerFrom.value);
    this.isReportGenerating = true;
  }
  checkVisibleObject(id: number) {

    switch(id) {
      case 1:
        this.visibleObject.ship = true;
        this.visibleObject.section = true;
        this.visibleObject.department = true;
        this.visibleObject.group = true;
        this.visibleObject.generic = true;
        this.visibleObject.equipmentCode = true;
        this.visibleObject.equipmentDescription = true;
        break;
      case 2:
        this.visibleObject.shipStatus = true;
        this.visibleObject.equipmentCode = true;
        this.visibleObject.supplier = true;
        this.visibleObject.equipmentDescription = true;
        break;
      case 3:
        this.visibleObject.section = true;
        this.visibleObject.generic = true;
        this.visibleObject.group = true;
        this.visibleObject.equipmentInput = true;
        this.visibleObject.equipmentCodeInput = true;
        this.visibleObject.specificationName = true;
        this.visibleObject.equipmentModel= true;
        break;
      case 4:
        this.visibleObject.command = true;
        this.visibleObject.ship = true;
        this.visibleObject.class = true;
        this.visibleObject.department = true;
        this.visibleObject.specificationCheckBox = true;
        break;
      case 5:
        this.visibleObject.country = true;
        this.visibleObject.provider = true;
        break;
      case 6:
        this.visibleObject.class = true;
        this.visibleObject.group = true;
        break;
      case 7:
        this.visibleObject.equipmentInput = true;
        break;
      case 8:
        this.visibleObject.command = true;
        this.visibleObject.ship = true;
        this.visibleObject.class = true;
        this.visibleObject.department = true;
        break;
      default:
        break;
    }
    
  }
  closeVisibleObject() {
    for (const key in this.visibleObject) {
      this.visibleObject[key as keyof typeof this.visibleObject] = false;
    }
  }

  
  loadClassOptions(): void {
    this.apiService.get(`/master/class/?is_dropdown=true`).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.classOptions = response.map(item => ({
            name: item.description,
            value: item.id
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching class data:', error);
      }
    });
  }

  loadCommandOptions(): void {
    this.apiService.get(`/master/command/?is_dropdown=true`).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.commandOptions = response.map(item => ({
            name: item.name,
            value: item.id
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching command data:', error);
      }
    });
  }

  loadShipOptions(): void {
    this.apiService.get(`/master/ship/?is_dropdown=true`).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.shipOptions = response.map(item => ({
            name: item.name,
            value: item.id
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching ship data:', error);
      }
    });
  }

  loadEquipmentOptions(): void {
    this.apiService.get(`/master/equipment/?is_dropdown=true`).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.equipmentOptions = response.map(item => ({
            name: item.name,
            value: item.id
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching equipment data:', error);
      }
    });
  }

  handleSelectChange(event: any, fieldKey: string): void {
    //console.log(this.headerFrom.value);
    if(fieldKey === 'command'){
      this.apiService.get(`/master/ship/?is_dropdown=true&command=${event.value.value}`).subscribe(response =>{
       this.shipOptions = response
      });

    }else if(fieldKey === 'class'){
      this.apiService.get(`/master/ship/?is_dropdown=true&class_master=${event.value.value}&command=${this.headerFrom.value.Command.value}`).subscribe(response =>{
        this.shipOptions = response
       });

    }else if(fieldKey === 'ship'){
        this.apiService.get(`/master/equipment/?is_dropdown=true&ship=${event.value.id}`).subscribe(response =>{
          this.equipmentOptions = response
         });
    }

  }

}
