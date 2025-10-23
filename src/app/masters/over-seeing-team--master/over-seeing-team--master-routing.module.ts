import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverseeingTeamComponent } from './overseeing-team/overseeing-team.component';

const routes: Routes = [
  {
    path:'',
    component:OverseeingTeamComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OverSeeingTeamMasterRoutingModule { }
