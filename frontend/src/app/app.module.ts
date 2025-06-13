import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ✅ POUR ngModel et formGroup
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminComponent } from './pages/admin/admin.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { EditUserComponent } from './pages/edit-user/edit-user.component';
import { EditCourseComponent } from './pages/edit-course/edit-course.component';
import { CourseFormComponent } from './pages/course-form/course-form.component'; // si tu l’as

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    AdminComponent,
    ProfileComponent,
    EditUserComponent,
    EditCourseComponent,
    CourseFormComponent
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
