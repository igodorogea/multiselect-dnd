import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'material',
    loadChildren: () => import('./mat-multiselect-dnd/mat-multiselect-dnd.module').then(m => m.MatMultiselectDndModule)
  },
  {
    path: 'devextreme',
    loadChildren: () => import('./dx-multiselect-dnd/dx-multiselect-dnd.module').then(m => m.DxMultiselectDndModule)
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
