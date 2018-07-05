import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AgregarPage } from './agregar';

@NgModule({
  declarations: [
    AgregarPage,
  ],
  imports: [
    IonicPageModule.forChild(AgregarPage),
  ],
})
export class AgregarPageModule {}
