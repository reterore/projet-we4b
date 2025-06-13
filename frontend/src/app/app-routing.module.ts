import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import {CoursesComponent} from "./pages/courses/courses.component";
import {CourseFormComponent} from "./pages/course-form/course-form.component";
import {AuthGuard} from "./guards/auth.guard";
import {SelectCoursesComponent} from "./pages/select-courses/select-courses.component";
import { AdminComponent } from './pages/admin/admin.component';
import {ProfileComponent} from "./pages/profile/profile.component";
import {EditCourseComponent} from "./pages/edit-course/edit-course.component";
import {EditUserComponent} from "./pages/edit-user/edit-user.component";


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'select-courses', component: SelectCoursesComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'courses', component: CoursesComponent },
  { path: 'courses/new', component: CourseFormComponent },
  { path: 'courses/edit/:id', component: CourseFormComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'edit-user/:id', component: EditUserComponent },
  { path: 'edit-course/:id', component: EditCourseComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' },// route catch-all pour 404 !!! toujours laisser en dernier !!!




];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}





