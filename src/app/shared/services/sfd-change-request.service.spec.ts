import { TestBed } from '@angular/core/testing';

import { SfdChangeRequestService } from './sfd-change-request.service';

describe('SfdChangeRequestService', () => {
  let service: SfdChangeRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SfdChangeRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
