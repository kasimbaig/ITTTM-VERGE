import { TestBed } from '@angular/core/testing';

import { UnitServiceService } from './unit-service.service';

describe('UnitServiceService', () => {
  let service: UnitServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
