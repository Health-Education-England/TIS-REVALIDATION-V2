import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { Store, NgxsModule } from "@ngxs/store";
import { MaterialModule } from "../shared/material/material.module";
import { AllocateAdminActionsComponent } from "./allocate-admin-actions/allocate-admin-actions.component";
import { AllocateAdminAutocompleteComponent } from "./allocate-admin-autocomplete/allocate-admin-autocomplete.component";
import { AllocateAdminBtnComponent } from "./allocate-admin-btn/allocate-admin-btn.component";
import { Get } from "./state/admins.actions";
import { AdminsState } from "./state/admins.state";
import { AdminsPipe } from "./admins.pipe";

const adminComponents = [
  AllocateAdminAutocompleteComponent,
  AllocateAdminActionsComponent,
  AllocateAdminBtnComponent,
  AdminsPipe
];

@NgModule({
  declarations: [...adminComponents],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    NgxsModule.forFeature([AdminsState])
  ],
  exports: [...adminComponents]
})
export class AdminsModule {
  constructor(private store: Store) {
    this.store.dispatch(new Get());
  }
}
