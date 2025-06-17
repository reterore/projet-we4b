import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { CourseFormComponent } from './pages/course-form/course-form.component';
import { CourseDetailComponent } from './pages/course-detail/course-detail.component';
import { SelectCoursesComponent } from './pages/select-courses/select-courses.component';
import { EditCourseComponent } from './pages/edit-course/edit-course.component';
import { EditUserComponent } from './pages/edit-user/edit-user.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AdminComponent } from './pages/admin/admin.component';
import { UserListComponent} from "./pages/user-list/user-list.component";

import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'select-courses', component: SelectCoursesComponent, canActivate: [AuthGuard] },
  { path: 'user-list', component: UserListComponent, canActivate: [AuthGuard] },


  { path: 'courses', component: CoursesComponent },
  { path: 'courses/new', component: CourseFormComponent },
  { path: 'courses/edit/:id', component: CourseFormComponent },
  { path: 'courses/:id', component: CourseDetailComponent },

  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard, AuthGuard] },
  { path: 'edit-user/:id', component: EditUserComponent, canActivate: [AuthGuard, AuthGuard] },
  { path: 'edit-course/:id', component: EditCourseComponent, canActivate: [AuthGuard, AuthGuard] },

  { path: '**', redirectTo: 'login' } // !!! Toujours laisser à la fin !!!
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
//
