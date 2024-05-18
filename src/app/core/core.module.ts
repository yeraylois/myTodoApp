import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { FirestoreService } from './services/firestore.service';
import { AuthGuard } from './guards/auth.guard';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    AuthService,
    FirestoreService,
    AuthGuard
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}
