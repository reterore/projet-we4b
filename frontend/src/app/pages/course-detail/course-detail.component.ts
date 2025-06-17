import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentService, Content } from 'src/app/services/content.service';
import { ModuleService, Module } from 'src/app/services/module.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {
  contents: Content[] = [];
  courseId!: string;
  modules: Module[] = [];
  showModuleModal = false;
  newModuleTitle = '';
  isProf = false;

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService,
    private moduleService: ModuleService,
    private auth: AuthService,
    private router: Router
) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    const user = this.auth.getUser();
    this.isProf = user?.role === 'teacher';

    this.moduleService.getModulesByCourse(this.courseId).subscribe(mods => {
      this.modules = mods;
    });
  }

  addModule() {
    if (!this.newModuleTitle.trim()) return;

    const newMod: Module = {
      title: this.newModuleTitle,
      courseId: this.courseId
    };

    this.moduleService.createModule(newMod).subscribe({
      next: (mod) => {
        console.log('✅ Nouveau module ajouté :', mod); // <-- Ajoute ça pour vérif
        this.modules.push(mod);                         // <-- Très important
        this.newModuleTitle = '';
        this.showModuleModal = false;
      },
      error: (err) => console.error('Erreur création module', err)
    });
  }
  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
