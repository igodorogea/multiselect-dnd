import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'material',
    loadChildren: () => import('./multiselect-dnd/multiselect-dnd.module').then(m => m.MultiselectDndModule),
  },
  {
    path: 'devextreme',
    loadChildren: () => import('./dx-multiselect-dnd/dx-multiselect-dnd.module').then(m => m.DxMultiselectDndModule),
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
