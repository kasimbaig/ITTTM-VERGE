// src/app/services/group.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators'; // Import map and tap
import { ApiService } from '../../../services/api.service';
import { Group, NewGroupFormData } from '../../../shared/models/group.model';
import { Option } from '../ship.model';


@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private groupEndpoint = 'master/group/';

  constructor(private apiService: ApiService) {}

  getGroups(): Observable<Group[]> {
    return this.apiService.get<Group[]>(this.groupEndpoint);
  }

  getGroupById(id: number): Observable<Group> {
    return this.apiService.get<Group>(`${this.groupEndpoint}${id}/`);
  }

  addGroup(groupData: NewGroupFormData): Observable<Group> {
    const payload = {
      ...groupData,
      section: (groupData.section as any)?.value || groupData.section, // Handle if it's an Option object or just ID
      generic: (groupData.generic as any)?.value || groupData.generic, // Handle if it's an Option object or just ID
    };
    return this.apiService.post<Group>(this.groupEndpoint, payload);
  }

  updateGroup(id: number, groupData: Group): Observable<Group> {
    // Ensure section and generic are sent as IDs if they are full objects
    const payload = {
      ...groupData,
      section: typeof groupData.section === 'object' && groupData.section !== null ? groupData.section.id : groupData.section,
      generic: typeof groupData.generic === 'object' && groupData.generic !== null ? groupData.generic.id : groupData.generic,
    };
    return this.apiService.put<Group>(`${this.groupEndpoint}${id}/`, payload);
  }

  deleteGroup(id: any): Observable<any> { // Changed id to any to match common practice for delete
    return this.apiService.delete<any>(`${this.groupEndpoint}${id}/`);
  }

  /**
   * New method to get groups specifically for dropdown options.
   * Maps Group objects to Option objects.
   */
  getGroupOptions(): Observable<Option[]> {
   
    return this.apiService.get<Group[]>(this.groupEndpoint).pipe(
      map(groups => groups.map(group => ({
        label: group.name, // Assuming Group has a 'name' property
        value: group.id as number // Assuming Group has an 'id' property
      }))),
    );
  }
}