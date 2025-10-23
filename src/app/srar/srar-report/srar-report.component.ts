import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { GenericTableData, HeaderColumn } from '../SARARTRANSACTION/sarar-monthly/sub-component-monthly/operations/report/equipment-table.interface';
import {
  boilerRunningHoursAndInspectionDetailsHeader,
  consumptionLubricantHeader,
  equipmentRunningHoursHeader,
  cumulativeShipActivityHeader,
  eqptRhExtensionHeader,
  hoursUnderwayDistanceRunHeader,
  fuelConsumptionMonthWiseHeader,
  fuelConsumptionPropulsionWiseHeader,
  h2sSensorStatusHeader,
  shipActivityDetailsHeader,
  overallActivityInPlatformsHeader,
  srarAnualMonthReportHeader,
  srarGtgUtilisationHeader,
  fptCstReportHeader,
  srarAverageSpeedAnnualReportHeader
} from './srarReportHeader';

@Component({
  selector: 'app-srar-report',
  standalone: false,
  templateUrl: './srar-report.component.html',
  styleUrl: './srar-report.component.css'
})
export class SrarReportComponent implements OnInit {

  headerObject = {
    'equipment-running-hours': equipmentRunningHoursHeader,
    'boiler-running-hour-and-inspection-detail': boilerRunningHoursAndInspectionDetailsHeader,
    3: consumptionLubricantHeader,
    'hours-underway': hoursUnderwayDistanceRunHeader,
    5: cumulativeShipActivityHeader,
    6: shipActivityDetailsHeader,
    7: eqptRhExtensionHeader,
    8: overallActivityInPlatformsHeader,
    9: fuelConsumptionMonthWiseHeader,
    10: fuelConsumptionPropulsionWiseHeader,
    11: h2sSensorStatusHeader,
    12: srarAnualMonthReportHeader,
    13: srarAnualMonthReportHeader,
    14: srarGtgUtilisationHeader,
    15: srarAverageSpeedAnnualReportHeader,
    16: fptCstReportHeader,
  };

  openFullScreenSararMonthly: boolean = false;
  reportName: any;

  // Removed static data — will be loaded from API
  shipOptions: any[] = [];
  monthOptions: any[] = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 },
  ];
  yearOptions: any[] = [
    { name: '2022', value: 2022 },
    { name: '2023', value: 2023 },
    { name: '2024', value: 2024 },
    { name: '2025', value: 2025 },
    { name: '2026', value: 2026 },
    { name: '2027', value: 2027 },
    { name: '2028', value: 2028 },
    { name: '2029', value: 2029 },
    { name: '2030', value: 2030 },
  ];
  commandOptions: any[] = [];
  classOptions: any[] = [];
  equipmentOptions: any[] = [
    { name: 'Equipment 1', value: 'equipment1' },
  ];

  headerFrom: FormGroup = new FormGroup({
    'Command': new FormControl(''),
    'Class': new FormControl(''),
    'Ship': new FormControl(''),
    'Equipment': new FormControl(''),
    'From Month': new FormControl(''),
    'To Month': new FormControl(''),
    'From Year': new FormControl(''),
    'To Year': new FormControl(''),
  });

  reportHeader: HeaderColumn[][] = [];
  reportData: GenericTableData[] = [];

  constructor(
    public apiService: ApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.openFullScreenSararMonthly = true;
    this.reportName = this.apiService.getReportName();
    this.reportHeader = this.headerObject[this.reportName.id as keyof typeof this.headerObject];
    //console.log(this.reportName);

    // Load class options from API
    this.loadClassOptions();

    // Load command options from API
    this.loadCommandOptions();

    // Load ship options from API
    this.loadShipOptions();

    // Load equipment options from API
    this.loadEquipmentOptions();
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

  redirectToSFD(subPath: string): void {
    this.openFullScreenSararMonthly = false;
    this.router.navigate([subPath]);
  }

  isReportGenerating: boolean = false;
  tableData:GenericTableData[] = [];
  viewReport(): void {
    
    this.apiService.get(`/srar/srar-reports/${this.reportName.id}/?command_id=${this.headerFrom.value.Command.value}&class_id=${this.headerFrom.value.Class.value}&ship_id=${this.headerFrom.value.Ship.id}&equipment_id=${this.headerFrom.value.Equipment.id}&from_month=${this.headerFrom.value['From Month'].value}&to_month=${this.headerFrom.value['To Month'].value}&from_year=${this.headerFrom.value['From Year'].value}&to_year=${this.headerFrom.value['To Year'].value}`).subscribe(response =>{
      // Add serial numbers to the table data
      this.tableData = this.addSerialNumbers(response.results);
      this.isReportGenerating = true;
    });
    // this.tableData=[ {
    //         "monthYear": "1/2025",
    //         "ship_name": "INS SUVARNA",
    //         "command_name": "Western Naval Command",
    //         "equipment_name": "AC CHILLED WATER PUMP (TSBC 4/40)",
    //         "equipment_code": "04401036",
    //         "location_name": "Engine Room",
    //         "hours_underway": 122.0,
    //         "equipment_running_hours": 122.0
    //     } ];
  }

  /**
   * Add serial numbers to the table data
   * @param data The raw table data from API
   * @returns The data with serial numbers added
   */
  private addSerialNumbers(data: any[]): any[] {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item, index) => ({
      ...item,
      srNo: index + 1
    }));
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
