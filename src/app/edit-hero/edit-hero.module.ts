import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { EditHeroPageRoutingModule } from './edit-hero-routing.module';
import { EditHeroPage } from './edit-hero.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditHeroPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [EditHeroPage],
})
export class EditHeroPageModule {}
