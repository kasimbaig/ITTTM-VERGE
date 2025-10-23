import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverseeingTeamComponent } from './overseeing-team.component';

describe('OverseeingTeamComponent', () => {
  let component: OverseeingTeamComponent;
  let fixture: ComponentFixture<OverseeingTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverseeingTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverseeingTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
