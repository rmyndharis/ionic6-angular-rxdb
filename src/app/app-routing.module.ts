import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'edit-hero',
    loadChildren: () =>
      import('./edit-hero/edit-hero.module').then((m) => m.EditHeroPageModule),
  },
  {
    path: 'add-hero',
    loadChildren: () =>
      import('./add-hero/add-hero.module').then((m) => m.AddHeroPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
