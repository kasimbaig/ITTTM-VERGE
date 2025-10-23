import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { parse, Kind, type DocumentNode, type SelectionNode, type FieldNode } from 'graphql';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-graph-ql',
  standalone: false,
  templateUrl: './graph-ql.component.html',
  styleUrls: ['./graph-ql.component.css']
})
export class GraphQLComponent implements OnInit {
  rows: any[] = [];
  tableColumns: any[] = [];
  displayQueryBuilder = false;
  generatedQuery = '';
  selectedRole: string = '';
  selectedProcess: string = '';
  selectedFields: {
    id: boolean;
    nomenclature: boolean;
    oemPartNumber: boolean;
    noOfFits: boolean;
    shipId: boolean;
    shipName: boolean;
    equipmentId: boolean;
    equipmentName: boolean;
    parentEquipmentId: boolean;
    parentEquipmentName: boolean;
    locationId: boolean;
    locationName: boolean;
    installationDate: boolean;
    removalDate: boolean;
    serviceLife: boolean;
    authorityOfRemoval: boolean;
    authorityOfInstallation: boolean;
    isSrarEquipment: boolean;
    removalRemarks: boolean;
  } = {
    id: true,
    nomenclature: true,
    oemPartNumber: true,
    noOfFits: false,
    shipId: false,
    shipName: true,
    equipmentId: false,
    equipmentName: true,
    parentEquipmentId: false,
    parentEquipmentName: false,
    locationId: false,
    locationName: false,
    installationDate: false,
    removalDate: false,
    serviceLife: false,
    authorityOfRemoval: false,
    authorityOfInstallation: false,
    isSrarEquipment: false,
    removalRemarks: false,
  };
  
  constructor(private apollo: Apollo, private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadRolesAndProcesses();
    this.getSavedQueries();
    this.updateGeneratedQuery();
     }
  
  
 generateTableColumnsFromQuery(query: string) {
   const document: DocumentNode = parse(query);
   const columns: Array<{ field: string; header: string, filter: string , type: string, sort: string }> = [];
   const seenFields = new Set<string>();

   const toTitleCase = (path: string): string => {
     return path
       .split('.')
       .map((segment) =>
         segment
           .replace(/_/g, ' ')
           .replace(/([a-z])([A-Z])/g, '$1 $2')
           .replace(/^\w/, (c) => c.toUpperCase())
       )
       .join(' ');
   };

   const addColumn = (path: string) => {
     if (seenFields.has(path)) return;
     seenFields.add(path);
     columns.push({ field: path, header: toTitleCase(path), filter: 'true', type: 'text', sort: 'true' });
   };

   const visitSelections = (selections: readonly SelectionNode[], parentPath: string) => {
     for (const selection of selections) {
       if (selection.kind !== Kind.FIELD) continue;
       const fieldNode = selection as FieldNode;
       const name = fieldNode.name.value;

       // Skip operation root keywords and unwrap the list field 'allSfdDetails'
       if (name === 'query' || name === 'mutation') continue;
       const nextParent = name === 'allSfdDetails' && fieldNode.selectionSet ? parentPath : (parentPath ? `${parentPath}.${name}` : name);

       if (fieldNode.selectionSet && name !== 'allSfdDetails') {
         visitSelections(fieldNode.selectionSet.selections, nextParent);
       } else if (!fieldNode.selectionSet) {
         addColumn(nextParent);
       } else {
         // name === 'allSfdDetails' and has selection set
         visitSelections(fieldNode.selectionSet.selections, nextParent);
       }
     }
   };

   for (const def of document.definitions) {
     if (def.kind === Kind.OPERATION_DEFINITION && def.selectionSet) {
       visitSelections(def.selectionSet.selections, '');
     }
   }

   return columns;
 }

  // Build query string from checkbox selections
  updateGeneratedQuery(): void {
    this.generatedQuery = this.generateQueryFromSelection();
  }

  private generateQueryFromSelection(): string {
    const rootFields: string[] = [];
    const nested: Record<string, Set<string>> = {
      ship: new Set<string>(),
      equipment: new Set<string>(),
      parentEquipment: new Set<string>(),
      location: new Set<string>(),
    };

    const s = this.selectedFields;

    // Root-level fields
    if (s.id) rootFields.push('id');
    if (s.nomenclature) rootFields.push('nomenclature');
    if (s.oemPartNumber) rootFields.push('oemPartNumber');
    if (s.noOfFits) rootFields.push('noOfFits');
    if (s.installationDate) rootFields.push('installationDate');
    if (s.removalDate) rootFields.push('removalDate');
    if (s.serviceLife) rootFields.push('serviceLife');
    if (s.authorityOfRemoval) rootFields.push('authorityOfRemoval');
    if (s.authorityOfInstallation) rootFields.push('authorityOfInstallation');
    if (s.isSrarEquipment) rootFields.push('isSrarEquipment');
    if (s.removalRemarks) rootFields.push('removalRemarks');

    // Nested: ship
    if (s.shipId) nested['ship'].add('id');
    if (s.shipName) nested['ship'].add('name');

    // Nested: equipment
    if (s.equipmentId) nested['equipment'].add('id');
    if (s.equipmentName) nested['equipment'].add('name');

    // Nested: parentEquipment
    if (s.parentEquipmentId) nested['parentEquipment'].add('id');
    if (s.parentEquipmentName) nested['parentEquipment'].add('name');

    // Nested: location
    if (s.locationId) nested['location'].add('id');
    if (s.locationName) nested['location'].add('name');

    const nestedBlocks: string[] = [];
    for (const [parent, fields] of Object.entries(nested)) {
      if (fields.size > 0) {
        nestedBlocks.push(`      ${parent} {\n        ${Array.from(fields).join('\n        ')}\n      }`);
      }
    }

    // Ensure at least one field
    if (rootFields.length === 0 && nestedBlocks.length === 0) {
      rootFields.push('id');
    }

    const selectionLines = [
      ...rootFields.map((f) => `      ${f}`),
      ...nestedBlocks,
    ];

    const body = selectionLines.join('\n');

    return `query {\n  allSfdDetails {\n${body}\n  }\n}`;
  }

  applyQuery(): void {
   
    const payload = {
      "process": this.selectedProcess,
      "user_role": this.selectedRole,
      "query_text":this.generatedQuery,
      "is_active": true,

    }

    this.apiService.post(`config/query-configs/`, payload).subscribe(res=>{
      
    })

  }

  executeQuery(): void {
    this.updateGeneratedQuery();;

    const queryDoc = gql`${this.generatedQuery}`;
    this.apollo.watchQuery<{ allSfdDetails: any[] }>({ query: queryDoc })
        .valueChanges.subscribe(({ data }) => {
          this.rows = data?.allSfdDetails ?? [];
          this.tableColumns = this.generateTableColumnsFromQuery(this.generatedQuery);
          this.displayQueryBuilder = false;
        });
  }

  async copyQuery(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.generatedQuery);
    } catch {
      // Fallback for environments without clipboard API
      const temp = document.createElement('textarea');
      temp.value = this.generatedQuery;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }
  }

  selectAllFields(): void {
    Object.keys(this.selectedFields).forEach((k) => (this.selectedFields[k as keyof typeof this.selectedFields] = true));
    this.updateGeneratedQuery();
  }

  clearAllFields(): void {
    Object.keys(this.selectedFields).forEach((k) => (this.selectedFields[k as keyof typeof this.selectedFields] = false));
    this.updateGeneratedQuery();
  }



  processes: any[] = [];
  roles: any[] = [];
  loadRolesAndProcesses(): void {
    // Load roles
    this.apiService.get('access/user-roles/').subscribe(res => {
      this.roles = res || [];
    });

    // Load processes
    this.apiService.get('access/processes/').subscribe(res => {
      this.processes = res || [];
    });
  }

  getSavedQueries(): void {
    const pro= localStorage.getItem('user_process')
    const role= localStorage.getItem('user_role')
    if(pro !="undefined" && role !="undefined"){
    this.apiService.get('config/query-configs/?process='+pro+'&user_role__code='+role).subscribe(res => {
      const queryDoc = gql`${res.results[0].query_text}`;
      this.apollo.watchQuery<{ allSfdDetails: any[] }>({ query: queryDoc })
        .valueChanges.subscribe(({ data }) => {
          this.rows = data?.allSfdDetails ?? [];
          this.tableColumns = this.generateTableColumnsFromQuery(this.generatedQuery);
          // this.displayQueryBuilder = false;
        });
    });
  } else{
    this.apiService.get('config/query-configs/').subscribe(res => {
      const queryDoc = gql`${res.results.find((item:any)=> item.id == 10 ).query_text}`;
        //console.log(res.results.find((item:any)=> item.id == 10 ).query_text,"Identifier")
      this.apollo.watchQuery<{ allSfdDetails: any[] }>({ query: queryDoc })
        .valueChanges.subscribe(({ data }) => {
          this.rows = data?.allSfdDetails ?? [];
          this.tableColumns = this.generateTableColumnsFromQuery(res.results.find((item:any)=> item.id == 10 ).query_text);
          // this.displayQueryBuilder = false;
        });
    });
  }}
}
