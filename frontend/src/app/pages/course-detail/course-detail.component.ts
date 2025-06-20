  import { Component, OnInit } from '@angular/core';
  import { ActivatedRoute, Router } from '@angular/router';
  import { ContentService, Content } from 'src/app/services/content.service';
  import { ModuleService, Module, NewModule } from 'src/app/services/module.service';
  import { AuthService } from 'src/app/services/auth.service';
  import { CourseService, Course } from 'src/app/services/course.service'; // 👈 ajout
  @Component({
    selector: 'app-course-detail',
    templateUrl: './course-detail.component.html',
    styleUrls: ['./course-detail.component.css']
  })
  export class CourseDetailComponent implements OnInit {
    courseId!: string;
    course?: Course; // 👈 ajouté
    modules: Module[] = [];
    contents: Content[] = [];

    showModuleModal = false;
    newModuleTitle = '';
    isProf = false;

    openedModuleId: string | null = null;
    editingModuleId: string | null = null;
    editModuleTitle: string = '';

    showContentModal = false;
    newContentTitle = '';
    newContentText = '';
    newContentType = 'text';
    selectedFile: File | null = null;
    currentModuleId: string | null = null;

    editingContentId: string | null = null;
    editedContentTitle = '';
    editedContentText = '';


    constructor(
        private route: ActivatedRoute,
        private contentService: ContentService,
        private moduleService: ModuleService,
        private courseService: CourseService, // 👈 injecté
        private auth: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
      this.courseId = this.route.snapshot.paramMap.get('id')!;
      const user = this.auth.getUser();
      this.isProf = user?.role === 'teacher';

      // 🔽 Charger les infos du cours
      this.courseService.getCourse(this.courseId).subscribe({
        next: c => this.course = c,
        error: err => {
          console.error('Erreur chargement cours', err);
          this.router.navigate(['/dashboard']);
        }
      });

      // 🔽 Charger les modules du cours
      this.moduleService.getModulesByCourse(this.courseId).subscribe(mods => {
        this.modules = mods;
        this.loadContentsForModules();  // 👈 ici on charge les contenus pour chaque module
      });

    }

    goBack() {
      this.router.navigate(['/dashboard']);
    }

    toggleModule(moduleId: string) {
      this.openedModuleId = this.openedModuleId === moduleId ? null : moduleId;
    }

    startEditing(module: Module) {
      this.editingModuleId = module._id ?? null;
      this.editModuleTitle = module.title;
      this.openedModuleId = module._id;
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
        error: err => console.error('Erreur modification module', err)
      });
    }
    startAddContent(moduleId: string) {
      this.currentModuleId = moduleId;
      this.showContentModal = true;
      this.newContentTitle = '';
      this.newContentText = '';
      this.selectedFile = null;
      this.newContentType = 'text';
    }

    cancelAddContent() {
      this.showContentModal = false;
    }
    loadContentsForModules() {
      this.modules.forEach(module => {
        this.contentService.getContentsByModule(module._id).subscribe({
          next: contents => {
            module.contents = contents;
          },
          error: err => {
            console.error(`Erreur chargement contenus du module ${module._id}`, err);
          }
        });
      });
    }


    onFileSelected(event: any) {
      this.selectedFile = event.target.files[0];
    }

    submitContent() {
      console.log('[submitContent] Début');

      if (!this.currentModuleId || !this.newContentTitle) {
        console.warn('[submitContent] Module ID ou titre manquant', {
          currentModuleId: this.currentModuleId,
          newContentTitle: this.newContentTitle
        });
        return;
      }

      const formData = new FormData();
      formData.append('title', this.newContentTitle);
      formData.append('type', this.newContentType);
      formData.append('moduleId', this.currentModuleId);

      if (this.newContentType === 'text') {
        console.log('[submitContent] Ajout de contenu texte');
        formData.append('text', this.newContentText);
      } else if (this.newContentType === 'file') {
        if (this.selectedFile) {
          console.log('[submitContent] Ajout de fichier', this.selectedFile);
          formData.append('file', this.selectedFile);
        } else {
          console.warn('[submitContent] Aucun fichier sélectionné');
          return;
        }
      } else {
        console.warn('[submitContent] Type inconnu :', this.newContentType);
        return;
      }

      this.contentService.addContent(formData).subscribe({
        next: content => {
          console.log('Contenu ajouté :', content);

          // Injecte le contenu dans le bon module
          const mod = this.modules.find(m => m._id === content.moduleId);
          if (mod) {
            if (!mod.contents) mod.contents = []; // sécurité si undefined
            mod.contents.push(content);
          }

          this.cancelAddContent(); // referme la modal
        },
        error: err => console.error('Erreur ajout contenu', err)
      });
    }


    deleteModule(moduleId: string) {
      if (confirm('Voulez-vous vraiment supprimer ce module ?')) {
        this.moduleService.deleteModule(moduleId).subscribe({
          next: () => {
            this.modules = this.modules.filter(m => m._id !== moduleId);
            if (this.openedModuleId === moduleId) this.openedModuleId = null;
          },
          error: err => console.error('Erreur suppression module', err)
        });
      }
    }

    addModule() {
      if (!this.newModuleTitle.trim()) return;

      const newMod: NewModule = {
        title: this.newModuleTitle,
        courseId: this.courseId
      };

      this.moduleService.createModule(newMod).subscribe({
        next: mod => {
          this.modules.push(mod);
          this.newModuleTitle = '';
          this.showModuleModal = false;
        },
        error: err => console.error('Erreur création module', err)
      });
    }

    startEditingContent(content: Content) {
      this.editingContentId = content._id;
      this.editedContentTitle = content.title;
      this.editedContentText = content.text || '';
    }

    cancelEditContent() {
      this.editingContentId = null;
      this.editedContentTitle = '';
      this.editedContentText = '';
    }

    saveContentEdit(content: Content) {
      this.contentService.updateContent(content._id, {
        title: this.editedContentTitle,
        text: this.editedContentText
      }).subscribe({
        next: updated => {
          content.title = updated.title;
          content.text = updated.text;
          this.cancelEditContent();
        },
        error: err => console.error('Erreur modification contenu', err)
      });
    }

    deleteContent(content: Content, module: Module) {
      if (confirm('Supprimer ce contenu ?')) {
        this.contentService.deleteContent(content._id).subscribe({
          next: () => {
            module.contents = module.contents?.filter(c => c._id !== content._id);
          },
          error: err => console.error('Erreur suppression contenu', err)
        });
      }
    }

  }
