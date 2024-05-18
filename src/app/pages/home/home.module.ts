import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import {HeaderComponent} from "../../components/header/header.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    FaIconComponent
  ],
  exports: [
    HeaderComponent
  ],
  declarations: [HomePage, HeaderComponent]
})
export class HomePageModule {}
