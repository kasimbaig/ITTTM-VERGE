import { TestBed } from '@angular/core/testing';

import { SfdEquipmentDocumentDetailsService } from './sfd-equipment-document-details.service';

describe('SfdEquipmentDocumentDetailsService', () => {
  let service: SfdEquipmentDocumentDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SfdEquipmentDocumentDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
