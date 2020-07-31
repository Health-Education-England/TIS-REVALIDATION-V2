import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed, async, ComponentFixture } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { NgxsModule } from "@ngxs/store";
import { AppComponent } from "./app.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { AdminsState } from "./admins/state/admins.state";
import { MainNavigationModule } from "./shared/main-navigation/main-navigation.module";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

describe("AppComponent", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MainNavigationModule,
        HttpClientTestingModule,
        NoopAnimationsModule, // no operation mock for replacing BrowserAnimationsModule in tests
        NgxsModule.forRoot([AdminsState])
      ],
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create the app", () => {
    expect(component).toBeTruthy();
  });
});
