import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ✅ POUR ngModel et formGroup
import { HttpClientModule } from '@angular/common/http';

import { CoursesComponent } from './pages/courses/courses.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminComponent } from './pages/admin/admin.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CourseDetailComponent } from './pages/course-detail/course-detail.component';
import { EditUserComponent } from './pages/edit-user/edit-user.component';
import { EditCourseComponent } from './pages/edit-course/edit-course.component';
import { CourseFormComponent } from './pages/course-form/course-form.component'; // si tu l’as
import { SelectCoursesComponent } from './pages/select-courses/select-courses.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { CreateCourseComponent } from './pages/create-course/create-course.component';


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
    CourseDetailComponent,
    EditUserComponent,
    EditCourseComponent,
    CourseFormComponent,
    UserListComponent,
    CreateCourseComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,            // ✅ POUR ngModel
    ReactiveFormsModule,    // ✅ POUR formGroup
    HttpClientModule        // ✅ POUR les requêtes HTTP
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
