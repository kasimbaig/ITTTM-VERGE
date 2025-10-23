import { TestBed } from '@angular/core/testing';

import { SfdDetailService } from './sfd-detail.service';

describe('SfdDetailService', () => {
  let service: SfdDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SfdDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
