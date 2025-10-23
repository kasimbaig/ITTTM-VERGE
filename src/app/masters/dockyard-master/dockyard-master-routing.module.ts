import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DockyardComponent } from './dockyard/dockyard.component';

const routes: Routes = [
  { path: '', component: DockyardComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DockyardMasterRoutingModule { }
