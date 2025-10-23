import { Component } from '@angular/core';
import { ApiService } from '../../../../../../services/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-gtg-parameter',
  standalone: false,
  templateUrl: './gtg-parameter.component.html',
  styleUrl: './gtg-parameter.component.css'
})
export class GtgParameterComponent {
  dropdownOptions: any[] = [
    { name: 'GTG J1', value: 'option1' },
    { name: 'GTG J2', value: 'option2' },
    { name: 'GTG J3', value: 'option3' },
    { name: 'GTG M1', value: 'option3' },
    { name: 'GTG M2', value: 'option3' }
  ];
  selectedOption: any;
  headerData:any;
  // Form model mapped to backend keys
  formData: {
    gtg_exploitation: number | null;
    fe_value: number | null;
    cu_value: number | null;
    fnt_filter_date: string | null; // YYYY-MM-DD
    ct_500_filter_date: string | null; // YYYY-MM-DD
    lub_oil_water_content: number | null;
    lub_oil_mechanical_impurities: number | null;
  } = {
    gtg_exploitation: null,
    fe_value: null,
    cu_value: null,
    fnt_filter_date: null,
    ct_500_filter_date: null,
    lub_oil_water_content: null,
    lub_oil_mechanical_impurities: null,
  };

  isFormEnabled = false;

  constructor(private apiService: ApiService, private messageService: MessageService) {}

  ngOnInit(): void {
    this.headerData=this.apiService.getData();
    this.apiService.get('srar/gtg-parameters/').subscribe((res: any) => {
    this.formData=res.results[0];
    });
  }
  
  

  onOptionChange(): void {
    // Enable inputs when an option is selected
    this.isFormEnabled = !!this.selectedOption;
    // If your dropdown provides an ID for the related exploitation record, set it here
    // Keeping structure intact; assigning a placeholder numeric id if available on option
    this.formData.gtg_exploitation = this.selectedOption?.id ?? null;
  }

  save(): void {
    // Build payload with only mapped keys; keep structure as-is
    const payload: any = {
      srar_monthly_header:this.headerData.id,
      gtg_exploitation: this.formData.gtg_exploitation,
      fe_value: this.formData.fe_value,
      cu_value: this.formData.cu_value,
      fnt_filter_date: this.formData.fnt_filter_date,
      ct_500_filter_date: this.formData.ct_500_filter_date,
      lub_oil_water_content: this.formData.lub_oil_water_content,
      lub_oil_mechanical_impurities: this.formData.lub_oil_mechanical_impurities,
    };

    // POST to gtg-parameters/
    this.apiService.post('srar/gtg-parameters/', payload).subscribe({
      next: (response) => {
        //console.log('Saved GTG parameters:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.message || 'GTG parameters saved successfully'
        });
      },
      error: (error) => {
        console.error('Error saving GTG parameters:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to save GTG parameters'
        });
      },
    });
  }

}
