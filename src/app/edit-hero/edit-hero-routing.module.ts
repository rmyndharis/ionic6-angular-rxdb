import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditHeroPage } from './edit-hero.page';

const routes: Routes = [
  {
    path: '',
    component: EditHeroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditHeroPageRoutingModule {}
