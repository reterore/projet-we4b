import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { CourseFormComponent } from './pages/course-form/course-form.component';
import { SelectCoursesComponent } from './pages/select-courses/select-courses.component';
import { AdminComponent } from './pages/admin/admin.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CourseDetailComponent } from './pages/course-detail/course-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    CoursesComponent,
    CourseFormComponent,
    SelectCoursesComponent,
    AdminComponent,
    ProfileComponent,
    CourseDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
