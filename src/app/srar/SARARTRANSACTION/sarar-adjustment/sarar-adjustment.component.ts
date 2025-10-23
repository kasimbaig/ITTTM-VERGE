import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-sarar-adjustment',
  standalone:false,
  templateUrl: './sarar-adjustment.component.html',
  styleUrl: './sarar-adjustment.component.css'
})
export class SararAdjustmentComponent implements OnInit {

  updateTypeOptions: any[] = [
    {name: 'Equipment Running Hrs', value: 'equipment_running_hrs'},
    {name: 'Ship Running hrs', value: 'ship_running_hrs'},
  ];
  shipOptions: any[] = [];
  monthOptions: any[] = [];
  yearOptions: any[] = [];
  equipmentCodeOptions: any[] = [];
  sararAdjustmentForm: FormGroup = new FormGroup({
    update_type: new FormControl(''),
    ship: new FormControl(''),
    hours_underway_since_first_commissioning: new FormControl(''),
    distance_run_since_first_commissioning: new FormControl(''),
    month: new FormControl(''),
    year: new FormControl(''),
    equipment_code: new FormControl(),
    location_on_board: new FormControl({value: '', disabled: true}),
    location_code: new FormControl({value: '', disabled: true}),
    equipment_serial_no: new FormControl({value: '', disabled: true}),
    hours_for_month: new FormControl(),
   
  
  });

  constructor(private apiService: ApiService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadShipOptions();
    this.loadMonthOptions();
    this.loadYearOptions();
    this.loadEquipmentCodeOptions();
  }

  loadShipOptions(): void {
    this.apiService.get('/master/ship/?is_dropdown=true').subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response)) {
          this.shipOptions = response.map((ship: any) => ({
            name: ship.name,
            value: ship.id
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching ship options:', error);
        this.shipOptions = [];
      }
    });
  }

  loadEquipmentCodeOptions(): void {
    this.apiService.get('sfd/sfd-details/?is_srar_equipment=True&is_dropdown=true').subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response)) {
          this.equipmentCodeOptions = response.map((equipment: any) => ({
            name: `${equipment.equipment_name}-${equipment.equipment_code}`,
            value: equipment.id,
            location_name: equipment.location_name,
            location_code: equipment.location_code,
            oem_part_number: equipment.oem_part_number,
            ship_sr_no: equipment.ship_sr_no
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching equipment code options:', error);
        this.equipmentCodeOptions = [];
      }
    });
  }

  loadMonthOptions(): void {
    this.monthOptions = [
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
      { name: 'December', value: 12 }
    ];
  }

  loadYearOptions(): void {
    const currentYear = new Date().getFullYear();
    this.yearOptions = [];
    for (let year = currentYear; year >= currentYear - 10; year--) {
      this.yearOptions.push({ name: year.toString(), value: year });
    }
  }
  
  onEquipmentCodeChange(){
    const selectedEquipmentId = this.sararAdjustmentForm.get('equipment_code')?.value;
    if (selectedEquipmentId) {
      const selectedEquipment = this.equipmentCodeOptions.find(option => option.value === selectedEquipmentId);
      if (selectedEquipment) {
      //console.log(selectedEquipment);
        this.sararAdjustmentForm.get('location_on_board')?.setValue(selectedEquipment.location_name);
        // Auto-fill location code
        this.sararAdjustmentForm.get('location_code')?.setValue(selectedEquipment.location_code);
        // Auto-fill equipment serial number
        this.sararAdjustmentForm.get('equipment_serial_no')?.setValue(selectedEquipment.ship_sr_no);
      }
    }
  }

  onSubmit(): void {
    if (this.sararAdjustmentForm.valid) {
      // Prepare the payload according to the Django model
      const payload: any = {
        adjustment_type: null,
        ship: this.sararAdjustmentForm.get('ship')?.value,
        month: this.sararAdjustmentForm.get('month')?.value,
        year: this.sararAdjustmentForm.get('year')?.value
      };

      // Map adjustment type to Django model values
      const updateType = this.sararAdjustmentForm.get('update_type')?.value;
      if (updateType === 'ship_running_hrs') {
        payload.adjustment_type = 1; // Ship Running Hours
        payload.hours_underway_since_first_commissioning = this.sararAdjustmentForm.get('hours_underway_since_first_commissioning')?.value;
        payload.distance_run_since_first_commissioning = this.sararAdjustmentForm.get('distance_run_since_first_commissioning')?.value;
      } else if (updateType === 'equipment_running_hrs') {
        payload.adjustment_type = 2; // Equipment Running Hours
        payload.equipment_sr_no = this.sararAdjustmentForm.get('equipment_serial_no')?.value;
        payload.hours_for_month = this.sararAdjustmentForm.get('hours_for_month')?.value;
        // Only send sfd_details ID, not the other equipment-related fields
        payload.sfd_details = this.sararAdjustmentForm.get('equipment_code')?.value;
      }

      // Remove null/undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
          delete payload[key];
        }
      });

      this.apiService.post('/srar/srar-adjustments/', payload).subscribe({
        next: (response: any) => {
          //console.log('SRAR Adjustment submitted successfully:', response);
          // Reset form or show success message
          this.resetForm();
          // You can add a success toast/notification here
          this.toastService.showSuccess('SRAR Adjustment submitted successfully!');
        },
        error: (error) => {
          console.error('Error submitting SRAR Adjustment:', error);
          // You can add an error toast/notification here
          this.toastService.showError('Error submitting SRAR Adjustment.');
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.sararAdjustmentForm.controls).forEach(key => {
        const control = this.sararAdjustmentForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }

  resetForm(): void {
    this.sararAdjustmentForm.reset();
    // Re-enable disabled fields
    this.sararAdjustmentForm.get('location_on_board')?.enable();
    this.sararAdjustmentForm.get('location_code')?.enable();
    this.sararAdjustmentForm.get('equipment_serial_no')?.enable();
  }

}
