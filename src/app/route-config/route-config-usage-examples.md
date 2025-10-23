# Route Config Component - API Integration Examples

The Route Config Component now integrates with the `config/route-configs/` API endpoint. Here are comprehensive examples for each form type:

## API Endpoint Integration

**Endpoint:** `POST config/route-configs/`

**Payload Structure:**
```json
{
  "directorate": 22,
  "permissions": [],
  "route_type": "external",
  "sub_module": 35,
  "user": null,
  "vessel": 2
}
```

## Form-Specific Implementations

### 1. Intermediate Form (Submodule: 35)

```html
<!-- In intermediate-form.component.html -->
<app-route-config 
  [useApi]="true"
  [transactionId]="intermediateForm.get('id')?.value || 'new'"
  [submodule]="35"
  [vesselId]="intermediateForm.get('inspectionType')?.value"
  [formTitle]="'Intermediate Form Route Config'"
  (routeConfigSaved)="onRouteConfigSaved($event)"
  (nextStepClicked)="onNextStep($event)"
  (timelineToggled)="onTimelineToggle($event)">
</app-route-config>
```

**Generated Payload Example:**
```json
{
  "directorate": 22,
  "permissions": [],
  "route_type": "external",
  "sub_module": 35,
  "user": null,
  "vessel": 2
}
```

### 2. Final Form (Submodule: 36)

```html
<!-- In final-form.component.html -->
<app-route-config 
  [useApi]="true"
  [transactionId]="finalForm.get('id')?.value || 'new'"
  [submodule]="36"
  [vesselId]="finalForm.get('inspectionReference')?.value"
  [formTitle]="'Final Form Route Config'"
  (routeConfigSaved)="onRouteConfigSaved($event)"
  (nextStepClicked)="onNextStep($event)"
  (timelineToggled)="onTimelineToggle($event)">
</app-route-config>
```

**Generated Payload Example:**
```json
{
  "directorate": 15,
  "permissions": [],
  "route_type": "external",
  "sub_module": 36,
  "user": null,
  "vessel": 3
}
```

### 3. U/W Compartments Form (Submodule: 37)

```html
<!-- In uw-compartments-form.component.html -->
<app-route-config 
  [useApi]="true"
  [transactionId]="uwCompartmentsForm.get('id')?.value || 'new'"
  [submodule]="37"
  [vesselId]="uwCompartmentsForm.get('inspectionReport')?.value"
  [formTitle]="'U/W Compartments Route Config'"
  (routeConfigSaved)="onRouteConfigSaved($event)"
  (nextStepClicked)="onNextStep($event)"
  (timelineToggled)="onTimelineToggle($event)">
</app-route-config>
```

**Generated Payload Example:**
```json
{
  "directorate": 18,
  "permissions": [],
  "route_type": "external",
  "sub_module": 37,
  "user": null,
  "vessel": 1
}
```

## Component TypeScript Implementation

### Add these methods to your form component:

```typescript
// In intermediate-form.component.ts (or any form component)

export class IntermediateFormComponent implements OnInit {
  // ... existing code ...

  // Route Config Event Handlers
  onRouteConfigSaved(event: any): void {
   
    
    if (event.success) {
     
      // Show success message
      this.toastService.showSuccess('Route configuration saved successfully');
      
      // Handle successful save
      this.handleSuccessfulRouteConfigSave(event);
    } else {
      console.error('Route config save failed:', event.error);
      
      // Show error message
      this.toastService.showError('Failed to save route configuration');
      
      // Handle error
      this.handleRouteConfigError(event.error);
    }
  }

  onNextStep(event: any): void {
 
    
    // Handle forwarding for review
    const reviewData = {
      transactionId: event.transactionId,
      submodule: event.submodule,
      vesselId: event.vesselId,
      action: 'forward_for_review'
    };
    
    // Make API call to forward for review
    this.forwardForReview(reviewData);
  }

  onTimelineToggle(isVisible: boolean): void {

    
    // Handle timeline visibility change
    this.saveTimelinePreference(isVisible);
  }

  private handleSuccessfulRouteConfigSave(event: any): void {
    // Handle successful route config save
    // You can update UI, refresh data, etc.
    
    // Example: Refresh timeline data
    if (event.data && event.data.timeline) {
      // Update timeline if returned in response
    }
    
    // Example: Update form status
    this.updateFormStatus('route_configured');
  }

  private handleRouteConfigError(error: any): void {
    // Handle route config error
    console.error('Route config error details:', error);
    
    // Example: Show detailed error message
    if (error.error && error.error.message) {
      this.toastService.showError(`Error: ${error.error.message}`);
    }
  }

  private forwardForReview(data: any): void {
    // Implement API call to forward for review
    this.apiService.post('config/approval/', data).subscribe({
      next: (response) => {
        
        this.toastService.showSuccess('Form forwarded for review');
      },
      error: (error) => {
        console.error('Error forwarding for review:', error);
        this.toastService.showError('Failed to forward for review');
      }
    });
  }

  private saveTimelinePreference(isVisible: boolean): void {
    // Save user preference for timeline visibility
    localStorage.setItem('timelineVisible', isVisible.toString());
  }

  private updateFormStatus(status: string): void {
    // Update form status in your form data
  
  }
}
```

## Different Route Types Examples

### Internal Route Type Payload:
```json
{
  "directorate": null,
  "permissions": ["edit"],
  "route_type": "internal",
  "sub_module": 35,
  "user": 5,
  "vessel": 2
}
```

### External Route Type Payload:
```json
{
  "directorate": 22,
  "permissions": [],
  "route_type": "external",
  "sub_module": 35,
  "user": null,
  "vessel": 2
}
```

## Submodule IDs for Different Forms

| Form Type | Submodule ID | Description |
|-----------|--------------|-------------|
| Intermediate Form | 35 | Intermediate Underwater Hull Inspection |
| Final Form | 36 | Final Underwater Hull Inspection |
| U/W Compartments | 37 | U/W Compartments Inspection |
| Custom Form | 38+ | Any additional forms |

## Migration Steps

### Step 1: Update HTML Templates

**Before (Dummy Data):**
```html
<app-route-config></app-route-config>
```

**After (API Integration):**
```html
<app-route-config 
  [useApi]="true"
  [submodule]="35"
  [vesselId]="intermediateForm.get('inspectionType')?.value"
  (routeConfigSaved)="onRouteConfigSaved($event)">
</app-route-config>
```

### Step 2: Add Event Handlers

Add the event handler methods to your form component TypeScript file.

### Step 3: Test API Integration

1. **Test Route Configuration Save:**
   - Fill out the route config form
   - Submit and verify API call is made
   - Check console for payload structure

2. **Test Different Route Types:**
   - Test internal route type (user + permissions)
   - Test external route type (directorate)

3. **Test Error Handling:**
   - Test with invalid vessel ID
   - Test with network errors

## Error Handling Examples

### API Error Response Handling:
```typescript
onRouteConfigSaved(event: any): void {
  if (!event.success) {
    // Handle different error types
    if (event.error.status === 400) {
      this.toastService.showError('Invalid route configuration data');
    } else if (event.error.status === 404) {
      this.toastService.showError('Vessel or submodule not found');
    } else if (event.error.status === 500) {
      this.toastService.showError('Server error. Please try again.');
    } else {
      this.toastService.showError('Failed to save route configuration');
    }
  }
}
```

## Testing the Integration

### 1. Console Logging
The component logs detailed information:
- Form submission data
- API payload structure
- API response/error details

### 2. Network Tab
Check the Network tab in browser dev tools to see:
- POST request to `config/route-configs/`
- Request payload structure
- Response data

### 3. Event Emission
The component emits events with:
- Success/error status
- API response data
- Original payload sent
- Form context (transactionId, submodule, vesselId)

This makes the Route Config Component fully integrated with your API while maintaining backward compatibility!

## 1. Basic Usage (Dummy Data - Current Implementation)

```html
<!-- Current implementation in all forms -->
<app-route-config></app-route-config>
```

## 2. API Integration Examples

### Example 1: Intermediate Form with API Integration

```html
<!-- In intermediate-form.component.html -->
<app-route-config 
  [useApi]="true"
  [transactionId]="intermediateForm.get('id')?.value || 'new'"
  [submodule]="13"
  [formTitle]="'Intermediate Form Route Config'"
  (routeConfigSaved)="onRouteConfigSaved($event)"
  (nextStepClicked)="onNextStep($event)"
  (timelineToggled)="onTimelineToggle($event)">
</app-route-config>
```

### Example 2: Final Form with API Integration

```html
<!-- In final-form.component.html -->
<app-route-config 
  [useApi]="true"
  [transactionId]="finalForm.get('id')?.value || 'new'"
  [submodule]="14"
  [formTitle]="'Final Form Route Config'"
  (routeConfigSaved)="onRouteConfigSaved($event)"
  (nextStepClicked)="onNextStep($event)"
  (timelineToggled)="onTimelineToggle($event)">
</app-route-config>
```

### Example 3: U/W Compartments Form with API Integration

```html
<!-- In uw-compartments-form.component.html -->
<app-route-config 
  [useApi]="true"
  [transactionId]="uwCompartmentsForm.get('id')?.value || 'new'"
  [submodule]="15"
  [formTitle]="'U/W Compartments Route Config'"
  (routeConfigSaved)="onRouteConfigSaved($event)"
  (nextStepClicked)="onNextStep($event)"
  (timelineToggled)="onTimelineToggle($event)">
</app-route-config>
```

## 3. Component TypeScript Implementation

### Add these methods to your form component:

```typescript
// In intermediate-form.component.ts (or any form component)

export class IntermediateFormComponent implements OnInit {
  // ... existing code ...

  // Route Config Event Handlers
  onRouteConfigSaved(event: any): void {
 
    
    // Handle the saved route configuration
    const routeConfigData = {
      transactionId: event.transactionId,
      submodule: event.submodule,
      routeType: event.routeType,
      userId: event.userId,
      permissionType: event.permissionType,
      directorateId: event.directorateId
    };
    
    // Make API call to save route configuration
    this.saveRouteConfiguration(routeConfigData);
  }

  onNextStep(event: any): void {
   
    
    // Handle forwarding for review
    const reviewData = {
      transactionId: event.transactionId,
      submodule: event.submodule,
      action: 'forward_for_review'
    };
    
    // Make API call to forward for review
    this.forwardForReview(reviewData);
  }

  onTimelineToggle(isVisible: boolean): void {
    
    
    // Handle timeline visibility change
    // You can save user preference, update UI, etc.
    this.saveTimelinePreference(isVisible);
  }

  private saveRouteConfiguration(data: any): void {
    // Implement API call to save route configuration
    this.apiService.post('route-config/save', data).subscribe({
      next: (response) => {
       
        // Show success message
        this.toastService.showSuccess('Route configuration saved successfully');
      },
      error: (error) => {
        console.error('Error saving route configuration:', error);
        // Show error message
        this.toastService.showError('Failed to save route configuration');
      }
    });
  }

  private forwardForReview(data: any): void {
    // Implement API call to forward for review
    this.apiService.post('config/approval/', data).subscribe({
      next: (response) => {
      
        // Show success message
        this.toastService.showSuccess('Form forwarded for review');
      },
      error: (error) => {
        console.error('Error forwarding for review:', error);
        // Show error message
        this.toastService.showError('Failed to forward for review');
      }
    });
  }

  private saveTimelinePreference(isVisible: boolean): void {
    // Save user preference for timeline visibility
    localStorage.setItem('timelineVisible', isVisible.toString());
  }
}
```

## 4. API Endpoint Structure

### Timeline Data API Endpoint
```
GET /config/timeline/?submodule={submodule}&transaction_id={transactionId}
```

**Response Format:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Document Originator",
      "userType": "external",
      "status": "completed",
      "timestamp": "2024-09-20 09:00",
      "duration": "2h 30m",
      "hasInternal": false,
      "internalUsers": []
    },
    {
      "id": 2,
      "name": "Primary Reviewer",
      "userType": "external",
      "status": "working",
      "timestamp": "2024-09-21 14:30",
      "duration": "1d 5h 30m",
      "hasInternal": true,
      "internalUsers": [
        {
          "name": "Quality Assurance Analyst",
          "status": "completed",
          "timestamp": "2024-09-21 10:00",
          "role": "QA",
          "duration": "4h 15m"
        }
      ]
    }
  ]
}
```

### Route Configuration Save API Endpoint
```
POST /route-config/save
```

**Request Body:**
```json
{
  "transactionId": "123",
  "submodule": "13",
  "routeType": "internal",
  "userId": 1,
  "permissionType": "edit"
}
```

### Forward for Review API Endpoint
```
POST /config/approval/
```

**Request Body:**
```json
{
  "transactionId": "123",
  "submodule": "13",
  "action": "forward_for_review",
  "remarks": "Ready for review"
}
```

## 5. Custom API Endpoint Example

```html
<!-- Using custom API endpoint -->
<app-route-config 
  [useApi]="true"
  [apiEndpoint]="'custom/workflow/timeline'"
  [transactionId]="formId"
  [submodule]="customSubmodule"
  [formTitle]="'Custom Workflow Config'"
  (routeConfigSaved)="onCustomRouteConfigSaved($event)">
</app-route-config>
```

## 6. Conditional API Usage

```html
<!-- Conditional API usage based on form state -->
<app-route-config 
  [useApi]="!!intermediateForm.get('id')?.value"
  [transactionId]="intermediateForm.get('id')?.value"
  [submodule]="13"
  (routeConfigSaved)="onRouteConfigSaved($event)">
</app-route-config>
```

## 7. Error Handling

The component automatically handles API errors and falls back to dummy data if the API fails. You can also handle errors in your parent component:

```typescript
onRouteConfigSaved(event: any): void {
  if (event.error) {
    console.error('Route config error:', event.error);
    this.toastService.showError('Failed to save route configuration');
  } else {

    this.toastService.showSuccess('Route configuration saved');
  }
}
```

## 8. Migration Steps

To migrate from dummy data to API integration:

1. **Update HTML Template:**
   ```html
   <!-- Change from -->
   <app-route-config></app-route-config>
   
   <!-- To -->
   <app-route-config 
     [useApi]="true"
     [transactionId]="formId"
     [submodule]="submoduleId"
     (routeConfigSaved)="onRouteConfigSaved($event)"
     (nextStepClicked)="onNextStep($event)"
     (timelineToggled)="onTimelineToggle($event)">
   </app-route-config>
   ```

2. **Add Event Handlers to Component:**
   ```typescript
   // Add the event handler methods shown above
   ```

3. **Implement API Endpoints:**
   - Timeline data endpoint
   - Route configuration save endpoint
   - Forward for review endpoint

4. **Test the Integration:**
   - Verify timeline data loads correctly
   - Test route configuration saving
   - Test forward for review functionality

This makes the Route Config Component fully reusable and API-ready across all your forms!
