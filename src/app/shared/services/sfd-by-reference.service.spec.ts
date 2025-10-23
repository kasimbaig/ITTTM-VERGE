import { TestBed } from '@angular/core/testing';

import { SfdByReferenceService } from './sfd-by-reference.service';

describe('SfdByReferenceService', () => {
  let service: SfdByReferenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SfdByReferenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
