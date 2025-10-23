import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubmoduleComponent } from './submodule/submodule.component';

const routes: Routes = [
  { path: '', component: SubmoduleComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubmoduleMasterRoutingModule { }
