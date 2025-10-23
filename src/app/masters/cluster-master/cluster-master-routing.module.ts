import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClusterComponent } from './cluster/cluster.component';

const routes: Routes = [
  { path: '', component: ClusterComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClusterMasterRoutingModule { }
