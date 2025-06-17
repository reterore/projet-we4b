import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentService, Content } from 'src/app/services/content.service';
import {ModuleService, Module, NewModule} from 'src/app/services/module.service';
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
  editingModuleId: string | null = null;
  editModuleTitle: string = '';


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

    const newMod: NewModule = {
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
  openedModuleId: string | null = null;

  toggleModule(moduleId: string) {
    this.openedModuleId = this.openedModuleId === moduleId ? null : moduleId;
  }
  startEditing(module: Module) {
    this.editingModuleId = module._id ?? null;
    this.editModuleTitle = module.title;

    // 🔓 Ouvre automatiquement le module si fermé
    if (this.openedModuleId !== module._id) {
      this.openedModuleId = module._id;
    }
  }

  cancelEdit() {
    this.editingModuleId = null;
    this.editModuleTitle = '';
  }
  saveEdit(moduleId: string) {
    if (!this.editModuleTitle.trim()) return;

    this.moduleService.updateModule(moduleId, { title: this.editModuleTitle }).subscribe({
      next: () => {
        const mod = this.modules.find(m => m._id === moduleId);
        if (mod) mod.title = this.editModuleTitle;
        this.cancelEdit();
      },
      error: (err) => console.error('Erreur modification module', err)
    });
  }
  deleteModule(moduleId: string) {
    if (confirm('Voulez-vous vraiment supprimer ce module ?')) {
      this.moduleService.deleteModule(moduleId).subscribe({
        next: () => {
          this.modules = this.modules.filter(m => m._id !== moduleId);
          if (this.openedModuleId === moduleId) this.openedModuleId = null;
        },
        error: (err) => console.error('Erreur suppression module', err)
      });
    }
  }


}
