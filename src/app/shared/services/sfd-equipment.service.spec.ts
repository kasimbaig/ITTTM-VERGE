import { TestBed } from '@angular/core/testing';

import { SfdEquipmentService } from './sfd-equipment.service';

describe('SfdEquipmentService', () => {
  let service: SfdEquipmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SfdEquipmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
