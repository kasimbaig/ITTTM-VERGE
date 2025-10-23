import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GenericSpecificationComponent } from './generic-specification/generic-specification.component';
import { EquipmentSpecificationComponent } from './equipment-specification/equipment-specification.component';
import { EquipmentShipDetailsComponent } from './equipment-ship-details/equipment-ship-details.component';
import { EquipmentSupplierComponent } from './equipment-supplier/equipment-supplier.component';
import { HideEquipmentDetailsComponent } from './hide-equipment-details/hide-equipment-details.component';
import { SfdHierarchyComponent } from './sfd-hierarchy/sfd-hierarchy.component';
import { CountryComponent } from '../../masters/country-master/country/country.component';
import { EstablishmentComponent } from '../../masters/establishment-master/establishment-master.component';
import { PropulsionComponent } from '../../masters/propulsion-master/propulsion/propulsion.component';
import { ManufacturerMasterComponent } from '../../masters/manufacturer-master/manufacturer-master.component';
import { ClassComponent } from '../../masters/ship-master/class/class.component';
import { GroupComponent } from '../../masters/ship-master/group/group.component';
import { ShipMasterComponent } from '../../masters/ship-master/ship-master/ship-master.component';
import { SectionComponent } from '../../masters/ship-master/section/section.component';
import { EquipmentComponent } from '../../masters/equipment-master/equipment/equipment.component';
import { GenericComponent } from '../../masters/equipment-master/generic/generic.component';
import { SupplierComponent } from '../../masters/equipment-master/supplier/supplier.component';
import { OpsAuthorityComponent } from '../../masters/unit-master/ops-authority/ops-authority.component';

const routes: Routes = [
  { path: 'generic-specification', component: GenericSpecificationComponent },
  { path: 'sfd-hierarchy', component: SfdHierarchyComponent },
  { path: 'equipment-ship-details', component: EquipmentShipDetailsComponent },
  { path: 'equipment-supplier', component: EquipmentSupplierComponent },
  { path: 'hide-equipment-details', component: HideEquipmentDetailsComponent },
  { path: 'equipment-specification', component: EquipmentSpecificationComponent, },
  { path: 'country', component: CountryComponent, },
  { path: 'establishment', component: EstablishmentComponent, },
  { path: 'propulsion', component: PropulsionComponent, },
  { path: 'manufacturer', component: ManufacturerMasterComponent, },
  { path: 'ship-master', component: ShipMasterComponent },
  { path: 'group', component: GroupComponent },
  { path: 'section', component: SectionComponent },
  { path: 'class', component: ClassComponent }  ,
  { path: 'equipments', component: EquipmentComponent },
  { path: 'generic', component: GenericComponent },
  { path: 'supplier', component: SupplierComponent },
  { path: 'ops-authority', component: OpsAuthorityComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SfdMasterRoutingModule { }
