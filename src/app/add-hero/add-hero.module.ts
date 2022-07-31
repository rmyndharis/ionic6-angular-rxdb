import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AddHeroPageRoutingModule } from './add-hero-routing.module';
import { AddHeroPage } from './add-hero.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddHeroPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [AddHeroPage],
})
export class AddHeroPageModule {}
