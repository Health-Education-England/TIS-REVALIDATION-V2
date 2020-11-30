import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs";

import { MaterialModule } from "src/app/shared/material/material.module";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { ActionType } from "../constants";
import { mockConnectionResponse } from "../mock-data/conneciton-details-spec-data";
import { UpdateConnectionComponent } from "./update-connection.component";

describe("UpdateConnectionComponent", () => {
  let component: UpdateConnectionComponent;
  let fixture: ComponentFixture<UpdateConnectionComponent>;
  const actionText = "action";
  const reasonText = "reason";
  const dbcText = "dbc";

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MaterialModule,
        RouterTestingModule,
        ReactiveFormsModule,
        FormsModule,
        BrowserAnimationsModule
      ],
      declarations: [UpdateConnectionComponent],
      providers: [
        {
          provide: MatDialog,
          useClass: MdDialogMock
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateConnectionComponent);
    component = fixture.componentInstance;
    Object.defineProperty(component, "dbcs$", { writable: true });
    component.dbcs$ = of(mockConnectionResponse.dbcs);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();

    expect(component.dbcs).toBe(mockConnectionResponse.dbcs);
  });

  it("form invalid when empty", () => {
    expect(component.updateConnectionForm.valid).toBeFalsy();

    const action = component.updateConnectionForm.controls[actionText];
    expect(action.valid).toBeFalsy();
  });

  it("form should add reason control when any action selected", () => {
    component.updateConnectionForm.controls[actionText].setValue(
      ActionType.ADD_CONNECTION
    );

    const reason = component.updateConnectionForm.controls[reasonText];
    expect(reason).toBeDefined();
  });

  it("form should add dbc control when add connection selected", () => {
    component.updateConnectionForm.controls[actionText].setValue(
      ActionType.ADD_CONNECTION
    );

    const dbc = component.updateConnectionForm.controls[dbcText];
    expect(dbc).toBeDefined();
  });

  it("form should not have reasons when action is not add / remove", () => {
    component.updateConnectionForm.controls[actionText].setValue(
      ActionType.IGNORE_CONNECTION
    );

    const reason = component.updateConnectionForm.controls[reasonText];
    expect(reason).toBeDefined();
    expect(component.reasons.length).toBe(0);
  });

  it("form should not have dbc control when add connection is not selected", () => {
    component.updateConnectionForm.controls[actionText].setValue(
      ActionType.REMOVE_CONNECTION
    );

    const dbc = component.updateConnectionForm.controls[dbcText];
    expect(dbc).toBeUndefined();
  });

  it("form should get reset when resetForm() invoked", () => {
    expect(component.updateConnectionForm.valid).toBeFalsy();
    fillForm();

    expect(component.updateConnectionForm.valid).toBeTruthy();

    component.resetForm();
    expect(component.updateConnectionForm.valid).toBeFalsy();
  });

  it("form should invoke updateConnection() when add conneciton action selected", () => {
    spyOn(component.submittFormEvent, "emit");

    expect(component.updateConnectionForm.valid).toBeFalsy();
    fillForm();
    expect(component.updateConnectionForm.valid).toBeTruthy();
    component.onSubmitt();
  });

  it("form should invoke updateConnection() when remove conneciton action selected", () => {
    spyOn(component.submittFormEvent, "emit");

    expect(component.updateConnectionForm.valid).toBeFalsy();
    fillForm(ActionType.REMOVE_CONNECTION);
    expect(component.updateConnectionForm.valid).toBeTruthy();
    component.onSubmitt();
  });

  function fillForm(action: ActionType = ActionType.ADD_CONNECTION) {
    component.updateConnectionForm.controls[actionText].setValue(action);
    component.updateConnectionForm.controls[reasonText].setValue(
      "Conflict of interest"
    );
    if (action === ActionType.ADD_CONNECTION) {
      component.updateConnectionForm.controls[dbcText].setValue("1-ABCDE");
    }
  }
});

export class MdDialogMock {
  open(componentOrTemplateRef: ConfirmDialogComponent) {
    return {
      afterClosed: () => of(true)
    };
  }
}