import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShipGroupComponent } from './ship-group/ship-group.component';
import { ShipCategoryComponent } from './ship-category/ship-category.component';
import { DepartmentMasterComponent } from './department-master/department-master.component';
import { GroupComponent } from './group/group.component';
import { SectionComponent } from './section/section.component';
import { ClassComponent } from './class/class.component';
import { ShipMasterComponent } from './ship-master/ship-master.component';

const routes: Routes = [
  {
    path: '',
    component: ShipGroupComponent,
    children: [
      { path: '', redirectTo: 'ship-master', pathMatch: 'full' },
      { path: 'ship-master', component: ShipMasterComponent },
      { path: 'ship-category', component: ShipCategoryComponent },
      { path: 'departments', component: DepartmentMasterComponent },
      { path: 'group', component: GroupComponent },
      { path: 'section', component: SectionComponent },
      { path: 'class', component: ClassComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShipMasterRoutingModule { }
