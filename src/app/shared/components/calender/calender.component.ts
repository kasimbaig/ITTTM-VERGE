import { Component, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';

// PrimeNG imports
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DragDropModule } from 'primeng/dragdrop';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CalendarModule } from 'primeng/calendar';
import { TabsModule } from 'primeng/tabs';
interface Resource {
  id: string;
  name: string;
  avatar: string;
  role: string;
  groupId: string;
}

interface ResourceGroup {
  id: string;
  name: string;
  expanded: boolean;
  resources: Resource[];
}

interface Task {
  id: string;
  title: string;
  resourceId: string;
  startTime: Date;
  endTime: Date;
  color: string;
  status: string;
}

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-calender',
  standalone:true,
  imports:[DropdownModule,DialogModule,ButtonModule,TabsModule,TableModule,DragDropModule,OverlayPanelModule,CalendarModule,CommonModule,FormsModule,BrowserAnimationsModule],
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.scss']
})
export class CalenderComponent implements OnInit {

  // Timeline data
  resourceGroups: ResourceGroup[] = [];
  tasks: Task[] = [];
  timeSlots: Date[] = [];
  currentDate = new Date();
  
  // Dialog state
  displayTaskDialog = false;
  selectedTask: Task | null = null;
  
  // Dropdown options
  viewOptions: DropdownOption[] = [
    { label: 'Timeline', value: 'timeline' },
    { label: 'Calendar', value: 'calendar' },
    { label: 'Agenda', value: 'agenda' }
  ];
  
  statusOptions: DropdownOption[] = [
    { label: 'All Status', value: 'all' },
    { label: 'In Progress', value: 'progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' }
  ];
  
  // Selected dropdown values
  selectedView = 'timeline';
  selectedStatus = 'all';
  
  // Drag and drop
  draggedTask: Task | null = null;
  
  ngOnInit() {
    this.initializeData();
    this.generateTimeSlots();
  }
  
  initializeData() {
    // Initialize resource groups with hierarchical structure
    this.resourceGroups = [
      {
        id: 'contractors',
        name: 'Contractors',
        expanded: true,
        resources: [
          {
            id: 'c1',
            name: 'John Smith',
            avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            role: 'Senior Developer',
            groupId: 'contractors'
          },
          {
            id: 'c2',
            name: 'Sarah Johnson',
            avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            role: 'UI/UX Designer',
            groupId: 'contractors'
          },
          {
            id: 'c3',
            name: 'Mike Davis',
            avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            role: 'Full Stack Developer',
            groupId: 'contractors'
          }
        ]
      },
      {
        id: 'employees',
        name: 'Employees',
        expanded: true,
        resources: [
          {
            id: 'e1',
            name: 'Emily Chen',
            avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            role: 'Marketing Manager',
            groupId: 'employees'
          },
          {
            id: 'e2',
            name: 'David Wilson',
            avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            role: 'DevOps Engineer',
            groupId: 'employees'
          },
          {
            id: 'e3',
            name: 'Lisa Anderson',
            avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            role: 'Product Manager',
            groupId: 'employees'
          },
          {
            id: 'e4',
            name: 'Robert Taylor',
            avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            role: 'QA Engineer',
            groupId: 'employees'
          }
        ]
      },
      {
        id: 'freelancers',
        name: 'Freelancers',
        expanded: false,
        resources: [
          {
            id: 'f1',
            name: 'Alex Rodriguez',
            avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            role: 'Graphic Designer',
            groupId: 'freelancers'
          },
          {
            id: 'f2',
            name: 'Maria Garcia',
            avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            role: 'Content Writer',
            groupId: 'freelancers'
          }
        ]
      }
    ];
    
    // Initialize tasks
    this.tasks = [
      {
        id: 't1',
        title: 'Database Migration',
        resourceId: 'c1',
        startTime: new Date(2025, 0, 15, 9, 0),
        endTime: new Date(2025, 0, 15, 12, 0),
        color: '#3b82f6',
        status: 'progress'
      },
      {
        id: 't2',
        title: 'UI Design Review',
        resourceId: 'c2',
        startTime: new Date(2025, 0, 15, 10, 0),
        endTime: new Date(2025, 0, 15, 11, 30),
        color: '#10b981',
        status: 'completed'
      },
      {
        id: 't3',
        title: 'API Development',
        resourceId: 'c3',
        startTime: new Date(2025, 0, 15, 14, 0),
        endTime: new Date(2025, 0, 15, 17, 0),
        color: '#f59e0b',
        status: 'progress'
      },
      {
        id: 't4',
        title: 'Marketing Campaign',
        resourceId: 'e1',
        startTime: new Date(2025, 0, 15, 11, 0),
        endTime: new Date(2025, 0, 15, 13, 0),
        color: '#ef4444',
        status: 'pending'
      },
      {
        id: 't5',
        title: 'Code Review',
        resourceId: 'e2',
        startTime: new Date(2025, 0, 15, 15, 0),
        endTime: new Date(2025, 0, 15, 16, 0),
        color: '#8b5cf6',
        status: 'progress'
      },
      {
        id: 't6',
        title: 'Testing Phase',
        resourceId: 'e3',
        startTime: new Date(2025, 0, 15, 13, 30),
        endTime: new Date(2025, 0, 15, 15, 30),
        color: '#06b6d4',
        status: 'pending'
      },
      {
        id: 't7',
        title: 'Quality Assurance',
        resourceId: 'e4',
        startTime: new Date(2025, 0, 15, 9, 30),
        endTime: new Date(2025, 0, 15, 11, 0),
        color: '#84cc16',
        status: 'completed'
      },
      {
        id: 't8',
        title: 'Logo Design',
        resourceId: 'f1',
        startTime: new Date(2025, 0, 15, 12, 0),
        endTime: new Date(2025, 0, 15, 14, 0),
        color: '#f97316',
        status: 'progress'
      },
      {
        id: 't9',
        title: 'Content Creation',
        resourceId: 'f2',
        startTime: new Date(2025, 0, 15, 10, 30),
        endTime: new Date(2025, 0, 15, 12, 30),
        color: '#ec4899',
        status: 'pending'
      }
    ];
  }
  
  generateTimeSlots() {
    this.timeSlots = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      this.timeSlots.push(new Date(2025, 0, 15, hour, 0));
    }
  }
  
  toggleGroup(groupId: string) {
    const group = this.resourceGroups.find(g => g.id === groupId);
    if (group) {
      group.expanded = !group.expanded;
    }
  }
  
  getTasksForResource(resourceId: string): Task[] {
    return this.tasks.filter(task => task.resourceId === resourceId);
  }
  
  getTaskPosition(task: Task): any {
    const startHour = 8;
    const totalHours = 10; // 8 AM to 6 PM
    const containerWidth = 100; // percentage
    
    const taskStart = task.startTime.getHours() + (task.startTime.getMinutes() / 60);
    const taskEnd = task.endTime.getHours() + (task.endTime.getMinutes() / 60);
    const taskDuration = taskEnd - taskStart;
    
    const left = ((taskStart - startHour) / totalHours) * containerWidth;
    const width = (taskDuration / totalHours) * containerWidth;
    
    return {
      left: `${left}%`,
      width: `${width}%`
    };
  }
  
  getResourceName(resourceId: string): string {
    for (const group of this.resourceGroups) {
      const resource = group.resources.find(r => r.id === resourceId);
      if (resource) {
        return resource.name;
      }
    }
    return 'Unknown Resource';
  }
  
  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  openTaskDialog(task: Task) {
    this.selectedTask = task;
    this.displayTaskDialog = true;
  }
  
  closeTaskDialog() {
    this.displayTaskDialog = false;
    this.selectedTask = null;
  }
  
  // Drag and drop methods
  onTaskDragStart(task: Task) {
    this.draggedTask = task;
  }
  
  onTaskDragEnd() {
    this.draggedTask = null;
  }
  
  onResourceDrop(event: any, resourceId: string) {
    if (this.draggedTask) {
      // Update task resource
      const taskIndex = this.tasks.findIndex(t => t.id === this.draggedTask!.id);
      if (taskIndex !== -1) {
        this.tasks[taskIndex].resourceId = resourceId;
      }
    }
  }
  
  onResourceDragOver(event: any) {
    event.preventDefault();
  }
  
  // Navigation methods
  previousDay() {
    this.currentDate = new Date(this.currentDate.getTime() - 24 * 60 * 60 * 1000);
    this.generateTimeSlots();
  }
  
  nextDay() {
    this.currentDate = new Date(this.currentDate.getTime() + 24 * 60 * 60 * 1000);
    this.generateTimeSlots();
  }
  
  goToToday() {
    this.currentDate = new Date();
    this.generateTimeSlots();
  }
  
  formatCurrentDate(): string {
    return this.currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

}

// bootstrapApplication(AppComponent, {
//   providers: [
//     importProvidersFrom(BrowserAnimationsModule)
//   ]
// });

