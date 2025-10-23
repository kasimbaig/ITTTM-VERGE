import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  constructor(private apollo: Apollo) {}

  fetchTable<T = any>(query: string, variables?: Record<string, unknown>): Observable<T> {
    //console.log(query, variables);
    return this.apollo
      .watchQuery<{ result: T }>({
        query: gql`${query}`,
        variables,
        fetchPolicy: 'cache-first',
      })
      .valueChanges.pipe(map((res) => (res.data as any).result as T));
  }
}


