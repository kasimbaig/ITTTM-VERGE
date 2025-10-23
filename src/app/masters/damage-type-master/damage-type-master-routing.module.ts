import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DamageTypeComponent } from './damage-type/damage-type.component';

const routes: Routes = [
  { path: '', component: DamageTypeComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DamageTypeMasterRoutingModule { }
