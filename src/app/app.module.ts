import { NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './core/auth/login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthService } from './core/auth/services/auth-service/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  NgxUiLoaderConfig,
  NgxUiLoaderHttpModule,
  NgxUiLoaderModule,
  NgxUiLoaderRouterModule,
} from 'ngx-ui-loader';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MaintopModule } from './maintop/maintop.module';
import { FileUploadModule } from 'primeng/fileupload';
import { MenuModule } from 'primeng/menu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ProgressBarModule } from 'primeng/progressbar';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { OcrcComponent } from './features/dashboard/ocrc/ocrc.component';
import { DefectListComponent } from './features/dashboard/defect-list/defect-list.component';
import { OpdefComponent } from './features/dashboard/opdef/opdef.component';
import { TimelineModule } from 'primeng/timeline';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { FrequentDefectsComponent } from './features/dashboard/frequent-defects/frequent-defects.component';
import { NgChartsModule } from 'ng2-charts';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { TableComponent } from './shared/components/table/table.component';
import { PaginatedTableComponent } from './shared/components/paginated-table/paginated-table.component';
import { TokenInterceptor } from './core/auth/interceptors/token.interceptor';
import { NotificationInterceptor } from './core/auth/interceptors/notification.interceptor';
import { CalenderComponent } from "./shared/components/calender/calender.component";
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChatbotDialogComponent } from './chatbot-dialog/chatbot-dialog.component';
import { NgxPrintModule } from 'ngx-print';
import { AddFormComponent } from './shared/components/add-form/add-form.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProjectionChartComponent } from './features/dashboard/projection-chart/projection-chart.component';


const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  bgsColor: 'red',
  bgsOpacity: 0.5,
  bgsPosition: 'bottom-right',
  bgsSize: 60,
  bgsType: 'ball-spin-clockwise',
  blur: 5,
  delay: 0,
  fastFadeOut: true,
  fgsColor: '#0084ff',
  fgsPosition: 'center-center',
  fgsSize: 140,
  fgsType: 'double-bounce',
  gap: 24,
  logoPosition: 'center-center',
  logoSize: 90,
  logoUrl: '',
  masterLoaderId: 'master',
  overlayBorderRadius: '0',
  overlayColor: 'rgba(40, 40, 40, 0.9)',
  pbColor: '#0084ff',
  pbDirection: 'ltr',
  pbThickness: 6,
  hasProgressBar: true,
  text: '',
  textColor: '#FFFFFF',
  textPosition: 'center-center',
  maxTime: -1,
  minTime: 300,
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SidebarComponent,
    MainLayoutComponent,
    DashboardComponent,
    DefectListComponent,
    OpdefComponent,
    FrequentDefectsComponent,
    ChatbotDialogComponent
  ],
  imports: [
    NgxUiLoaderRouterModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    TableComponent,
    PaginatedTableComponent,
    ConfirmDialog,
    ToastModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    BrowserAnimationsModule,
    FileUploadModule,
    ButtonModule,
    TableModule,
    CommonModule,
    ChartModule,
    DropdownModule,
    DialogModule,
    CardModule,
    CalendarModule,
    ProgressBarModule,
    PanelMenuModule,
    MenuModule,
    TimelineModule,
    MultiSelectModule,
    TooltipModule,
    NgChartsModule,
    CalenderComponent,
    OcrcComponent,
    NgxChartsModule,
    NgxPrintModule,
    AddFormComponent,
    ConfirmDialogModule,
    ProjectionChartComponent
],
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '',
        },
      },
    }),
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        cache: new InMemoryCache(),
        link: httpLink.create({ uri: environment.graphqlUri })
      } as any;
    }),
    ConfirmationService,
    MessageService,
    { provide: HTTP_INTERCEPTORS, useClass: NotificationInterceptor, multi: true },
  ],
  exports: [TableComponent],
  bootstrap: [AppComponent],
})
export class AppModule { }
