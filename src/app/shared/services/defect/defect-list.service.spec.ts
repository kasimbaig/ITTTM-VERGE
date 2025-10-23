import { TestBed } from '@angular/core/testing';

import { DefectListService } from './defect-list.service';

describe('DefectListService', () => {
  let service: DefectListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DefectListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
