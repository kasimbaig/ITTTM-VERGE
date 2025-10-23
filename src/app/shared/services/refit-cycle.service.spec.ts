import { TestBed } from '@angular/core/testing';

import { RefitCycleService } from './refit-cycle.service';

describe('RefitCycleService', () => {
  let service: RefitCycleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RefitCycleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
