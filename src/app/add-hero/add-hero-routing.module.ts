import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddHeroPage } from './add-hero.page';

const routes: Routes = [
  {
    path: '',
    component: AddHeroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddHeroPageRoutingModule {}
