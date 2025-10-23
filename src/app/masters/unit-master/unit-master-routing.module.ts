import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnitGroupComponent } from './unit-group/unit-group.component';
import { CommandsComponent } from './commands/commands.component';
import { UnitsComponent } from './units/units.component';
import { OpsAuthorityComponent } from './ops-authority/ops-authority.component';
import { FrequencyMasterComponent } from './frequency-master/frequency-master.component';

const routes: Routes = [
  {
    path: '', 
    component: UnitGroupComponent, 
    children: [
      { path: '', redirectTo: 'commands', pathMatch: 'full' }, 
      { path: 'commands', component: CommandsComponent  },
      { path: 'units', component: UnitsComponent },
      { path: 'ops-authority', component: OpsAuthorityComponent },
      { path: 'frequency', component: FrequencyMasterComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnitMasterRoutingModule { }
