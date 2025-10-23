import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class SfdByReferenceService {
  private readonly endpoint = 'sfd/sfd-by-reference/';

  constructor(private apiService: ApiService) { }

  /**
   * Attaches SFD by reference by sending the form payload to the backend.
   * @param payload The data to be sent (section, master_class, apply_to, sfd_reference IDs).
   * @returns An Observable of the API response.
   */
  attachSfdByReference(payload: { section: number | null; master_class: number | null; apply_to: number | null; sfd_reference: number | null }): Observable<any> {
    return this.apiService.post(this.endpoint, payload);
  }
}
