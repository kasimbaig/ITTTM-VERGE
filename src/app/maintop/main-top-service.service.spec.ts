import { TestBed } from '@angular/core/testing';

import { MainTopServiceService } from './main-top-service.service';

describe('MainTopServiceService', () => {
  let service: MainTopServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainTopServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
