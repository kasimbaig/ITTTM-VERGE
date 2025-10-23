import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerSteamingDetailComponent } from './boiler-steaming-detail.component';

describe('BoilerSteamingDetailComponent', () => {
  let component: BoilerSteamingDetailComponent;
  let fixture: ComponentFixture<BoilerSteamingDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoilerSteamingDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoilerSteamingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
