import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MastersComponent } from './masters.component';
import { ShipComponent } from './ship/ship.component';
import { EstablishmentComponent } from './establishment-master/establishment-master.component';
import {  ManufacturerMasterComponent } from './manufacturer-master/manufacturer-master.component';
import { GraphQLComponent } from '../srar/SARARTRANSACTION/graph-ql/graph-ql.component';
import { FormBuildingComponent } from './form-building/form-building.component';

const routes: Routes = [
  {
    path: '',
    component: MastersComponent,
    children: [
      { path: '', redirectTo: 'ship-group', pathMatch: 'full' },
      {
        path: 'ship-group',
        loadChildren: () => import('./ship-master/ship-master.module').then(m => m.ShipMasterModule),
        data: {
          breadcrumb: 'Ship Master'
        },
      },
      {
        path: 'equipment-group',
        loadChildren: () => import('./equipment-master/equipment-master.module').then(m => m.EquipmentMasterModule)
      },
      {
        path: 'unit-group',
        loadChildren: () => import('./unit-master/unit-master.module').then(m => m.UnitMasterModule)
      },
      {
        path: 'overseeing-team',
        loadChildren: () => import('./over-seeing-team--master/over-seeing-team--master.module').then(m => m.OverSeeingTeamMasterModule)
      },
      {
        path: 'propulsion',
        loadChildren: () => import('./propulsion-master/propulsion-master.module').then(m => m.PropulsionMasterModule)
      },
      {
        path: 'country',
        loadChildren: () => import('./country-master/country-master.module').then(m => m.CountryMasterModule)
      },
      // {
      //   path: 'cluster',
      //   loadChildren: () => import('./cluster-master/cluster-master.module').then(m => m.ClusterMasterModule)
      // },
      {
        path: 'compartment',
        loadChildren: () => import('./compartment-master/compartment-master.module').then(m => m.CompartmentMasterModule)
      },
      {
        path: 'damage-type',
        loadChildren: () => import('./damage-type-master/damage-type-master.module').then(m => m.DamageTypeMasterModule)
      },
      {
        path: 'dockyard',
        loadChildren: () => import('./dockyard-master/dockyard-master.module').then(m => m.DockyardMasterModule)
      },
      // {
      //   path: 'fleet',
      //   loadChildren: () => import('./fleet-master/fleet-master.module').then(m => m.FleetMasterModule)
      // },
      {
        path: 'module',
        loadChildren: () => import('./module-master/module-master.module').then(m => m.ModuleMasterModule)
      },
      {
        path: 'operational-status',
        loadChildren: () => import('./operational-status-master/operational-status-master.module').then(m => m.OperationalStatusMasterModule)
      },
      {
        path: 'refit',
        loadChildren: () => import('./refit-master/refit-master.module').then(m => m.RefitMasterModule)
      },
      {
        path: 'submodule',
        loadChildren: () => import('./submodule-master/submodule-master.module').then(m => m.SubmoduleMasterModule)
      },
      {
        path: 'city',
        loadChildren: () => import('./city-master/city-master.module').then(m => m.CityMasterModule)
      },
      {
        path: 'equip-master',
        loadChildren: () => import('./equip-master/equip-master.module').then(m => m.EquipMasterModule)
      },
      {
        path: 'trial-units',
        loadChildren: () => import('./trial-units-master/trial-units-master.module').then(m => m.TrialUnitsMasterModule)
      },
      {
        path: 'system',
        loadChildren: () => import('./system-master/system-master.module').then(m => m.SystemMasterModule)
      },
      {
        path: 'vessel-class',
        loadChildren: () => import('./vessel-class-master/vessel-class-master.module').then(m => m.VesselClassMasterModule)
      },
      {
        path: 'vessel',
        loadChildren: () => import('./vessel-master/vessel-master.module').then(m => m.VesselMasterModule)
      },
      {
        path: 'section',
        loadChildren: () => import('./section-master/section-master.module').then(m => m.SectionMasterModule)
      },
      {
        path: 'state',
        loadChildren: () => import('./state-master/state-master.module').then(m => m.StateMasterModule)
      },
      {
        path: 'GRAPHQL',
        loadChildren: () => import('../srar/SARARTRANSACTION/graph-ql/graph-ql.component').then(m => m.GraphQLComponent)
      },
      {
        path: 'form-building',
        component: FormBuildingComponent
      },
      {
        path: 'station',
        loadChildren: () => import('./station-master/station-master.module').then(m => m.StationMasterModule)
      },
      {
        path:'establishment',
        component:EstablishmentComponent
      },
      {
        path:'manufacturer',
        component:ManufacturerMasterComponent
      },
      { path: 'ship', component: ShipComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MastersRoutingModule { }
