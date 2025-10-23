import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';

// Import all components
import { EquipmentNextRoutionDueComponent } from './equipment-next-roution-due/equipment-next-roution-due.component';
import { EoRemarkComponent } from './eo-remark/eo-remark.component';
import { RHExtensionComponent } from './r-h-extension/r-h-extension.component';
import { LubricantConsumptionComponent } from './lubricant-consumption/lubricant-consumption.component';
import { GtgParameterComponent } from './gtg-parameter/gtg-parameter.component';
import { GtgExploitationComponent } from './gtg-exploitation/gtg-exploitation.component';
import { GtRgExploitationComponent } from './gt-rg-exploitation/gt-rg-exploitation.component';
import { GTParameterComponent } from './g-t-parameter/g-t-parameter.component';
import { FullPowerTrialsComponent } from './full-power-trials/full-power-trials.component';
import { DgufComponent } from './dguf/dguf.component';
import { DieselEngineSdcComponent } from './diesel-engine-sdc/diesel-engine-sdc.component';
import { TestKitsCentrifugeComponent } from './test-kits-centrifuge/test-kits-centrifuge.component';
import { IccpH2sSensorMffsComponent } from './iccp-h2s-sensor-mffs/iccp-h2s-sensor-mffs.component';
import { FuelAvcatTorsionmeterComponent } from './fuel-avcat-torsionmeter/fuel-avcat-torsionmeter.component';
import { ShipActivityComponent } from './ship-activity/ship-activity.component';
import { BoilerSteamingDetailComponent } from './boiler-steaming-detail/boiler-steaming-detail.component';
import { ShipRunningDetailComponent } from './ship-running-detail/ship-running-detail.component';
import { FinalPageComponent } from './final-page/final-page.component';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MultiSelectModule } from 'primeng/multiselect';
import { ReportComponent } from './report/report.component';
import { NgxPrintModule } from 'ngx-print';


@NgModule({
  declarations: [
    EquipmentNextRoutionDueComponent,
    EoRemarkComponent,
    RHExtensionComponent,
    LubricantConsumptionComponent,
    GtgParameterComponent,
    GtgExploitationComponent,
    GtRgExploitationComponent,
    GTParameterComponent,
    FullPowerTrialsComponent,
    DgufComponent,
    DieselEngineSdcComponent,
    TestKitsCentrifugeComponent,
    IccpH2sSensorMffsComponent,
    FuelAvcatTorsionmeterComponent,
    ShipActivityComponent,
    BoilerSteamingDetailComponent,
    ShipRunningDetailComponent,
    FinalPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    CalendarModule,
    ToastModule,
    MatMenuModule,
    MatButtonModule,
    CheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MultiSelectModule,NgxPrintModule,
    ReportComponent,
  ],

  exports: [
    EquipmentNextRoutionDueComponent,
    EoRemarkComponent,
    RHExtensionComponent,
    LubricantConsumptionComponent,
    GtgParameterComponent,
    GtgExploitationComponent,
    GtRgExploitationComponent,
    GTParameterComponent,
    FullPowerTrialsComponent,
    DgufComponent,
    DieselEngineSdcComponent,
    TestKitsCentrifugeComponent,
    IccpH2sSensorMffsComponent,
    FuelAvcatTorsionmeterComponent,
    ShipActivityComponent,
    BoilerSteamingDetailComponent,
    ShipRunningDetailComponent,
    FinalPageComponent,
    
  ]
})
export class OperationsModule { }
