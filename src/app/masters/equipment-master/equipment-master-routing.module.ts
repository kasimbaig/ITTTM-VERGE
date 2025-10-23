import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EquipmentGroupComponent } from './equipment-group/equipment-group.component';
import { EquipmentComponent } from './equipment/equipment.component';
import { EquipmentTypeComponent } from './equipment-type/equipment-type.component';
import { EquipmentDiffComponent } from './equipment-diff/equipment-diff.component';
import { GenericComponent } from './generic/generic.component';
import { SupplierComponent } from './supplier/supplier.component';
import { EquipmentSpecificationComponent } from './equipment-specification/equipment-specification.component';

const routes: Routes = [
  {
    path: '',
    component: EquipmentGroupComponent,
    children: [
      { path: '', redirectTo: 'equipments', pathMatch: 'full' },
      { path: 'equipments', component: EquipmentComponent },
      { path: 'equipments-specification', component: EquipmentSpecificationComponent },
      { path: 'equipment-type', component: EquipmentTypeComponent },
      { path: 'equipment-diff', component: EquipmentDiffComponent },
      { path: 'generic', component: GenericComponent },
      { path: 'supplier', component: SupplierComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EquipmentMasterRoutingModule { }
