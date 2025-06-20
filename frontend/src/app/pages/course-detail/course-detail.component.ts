import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService, Content } from 'src/app/services/content.service';
import { ModuleService, Module, NewModule } from 'src/app/services/module.service';
import { AuthService } from 'src/app/services/auth.service';
import { CourseService, Course } from 'src/app/services/course.service';
import { ForumService, Forum, Message } from 'src/app/services/forum.service';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {
  courseId!: string;
  course?: Course;
  modules: Module[] = [];
  contents: Content[] = [];

  showModuleModal = false;
  newModuleTitle = '';
  isProf = false;

  openedModuleId: string | null = null;
  editingModuleId: string | null = null;
  editModuleTitle = '';

  showContentModal = false;
  newContentTitle = '';
  newContentText = '';
  newContentType = 'text';
  selectedFile: File | null = null;
  currentModuleId: string | null = null;

  editingContentId: string | null = null;
  editedContentTitle = '';
  editedContentText = '';

  forums: (Forum & { newMessage?: string })[] = [];
  newForumTitle = '';

  showForumModal = false;

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService,
    private moduleService: ModuleService,
    private courseService: CourseService,
    private auth: AuthService,
    private router: Router,
    private forumService: ForumService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    const user = this.auth.getUser();
    this.isProf = user?.role === 'teacher';

    this.courseService.getCourse(this.courseId).subscribe({
      next: (c: Course) => this.course = c,
      error: (err: any) => {
        console.error('Erreur chargement cours', err);
        this.router.navigate(['/dashboard']);
      }
    });

    this.moduleService.getModulesByCourse(this.courseId).subscribe({
      next: (mods: Module[]) => {
        this.modules = mods;
        this.loadContentsForModules();
      },
      error: (err: any) => console.error('Erreur chargement modules', err)
    });

    this.forumService.getForumsByCourse(this.courseId).subscribe({
      next: (forums: Forum[]) => this.forums = forums,
      error: (err: any) => console.error('Erreur chargement forums', err)
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleModule(moduleId: string): void {
    this.openedModuleId = this.openedModuleId === moduleId ? null : moduleId;
  }

  startEditing(module: Module): void {
    this.editingModuleId = module._id ?? null;
    this.editModuleTitle = module.title;
    this.openedModuleId = module._id;
  }

  cancelEdit(): void {
    this.editingModuleId = null;
    this.editModuleTitle = '';
  }

  saveEdit(moduleId: string): void {
    if (!this.editModuleTitle.trim()) return;
    this.moduleService.updateModule(moduleId, { title: this.editModuleTitle }).subscribe({
      next: () => {
        const mod = this.modules.find(m => m._id === moduleId);
        if (mod) mod.title = this.editModuleTitle;
        this.cancelEdit();
      },
      error: (err: any) => console.error('Erreur modification module', err)
    });
  }

  startAddContent(moduleId: string): void {
    this.currentModuleId = moduleId;
    this.showContentModal = true;
    this.newContentTitle = '';
    this.newContentText = '';
    this.selectedFile = null;
    this.newContentType = 'text';
  }

  cancelAddContent(): void {
    this.showContentModal = false;
  }

  loadContentsForModules(): void {
    this.modules.forEach(module => {
      this.contentService.getContentsByModule(module._id).subscribe({
        next: (contents: Content[]) => module.contents = contents,
        error: (err: any) => console.error(`Erreur chargement contenus du module ${module._id}`, err)
      });
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  submitContent(): void {
    if (!this.currentModuleId || !this.newContentTitle) return;

    const formData = new FormData();
    formData.append('title', this.newContentTitle);
    formData.append('type', this.newContentType);
    formData.append('moduleId', this.currentModuleId);

    if (this.newContentType === 'text') {
      formData.append('text', this.newContentText);
    } else if (this.newContentType === 'file' && this.selectedFile) {
      formData.append('file', this.selectedFile);
    } else {
      return;
    }

    this.contentService.addContent(formData).subscribe({
      next: (content: Content) => {
        const mod = this.modules.find(m => m._id === content.moduleId);
        if (mod) {
          if (!mod.contents) mod.contents = [];
          mod.contents.push(content);
        }
        this.cancelAddContent();
      },
      error: (err: any) => console.error('Erreur ajout contenu', err)
    });
  }

  deleteModule(moduleId: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce module ?')) {
      this.moduleService.deleteModule(moduleId).subscribe({
        next: () => {
          this.modules = this.modules.filter(m => m._id !== moduleId);
          if (this.openedModuleId === moduleId) this.openedModuleId = null;
        },
        error: (err: any) => console.error('Erreur suppression module', err)
      });
    }
  }

  addModule(): void {
    if (!this.newModuleTitle.trim()) return;

    const newMod: NewModule = {
      title: this.newModuleTitle,
      courseId: this.courseId
    };

    this.moduleService.createModule(newMod).subscribe({
      next: (mod: Module) => {
        this.modules.push(mod);
        this.newModuleTitle = '';
        this.showModuleModal = false;
      },
      error: (err: any) => console.error('Erreur création module', err)
    });
  }

  startEditingContent(content: Content): void {
    this.editingContentId = content._id;
    this.editedContentTitle = content.title;
    this.editedContentText = content.text || '';
  }

  cancelEditContent(): void {
    this.editingContentId = null;
    this.editedContentTitle = '';
    this.editedContentText = '';
  }

  saveContentEdit(content: Content): void {
    this.contentService.updateContent(content._id, {
      title: this.editedContentTitle,
      text: this.editedContentText
    }).subscribe({
      next: (updated: Content) => {
        content.title = updated.title;
        content.text = updated.text;
        this.cancelEditContent();
      },
      error: (err: any) => console.error('Erreur modification contenu', err)
    });
  }

  deleteContent(content: Content, module: Module): void {
    if (confirm('Supprimer ce contenu ?')) {
      this.contentService.deleteContent(content._id).subscribe({
        next: () => {
          module.contents = module.contents?.filter(c => c._id !== content._id);
        },
        error: (err: any) => console.error('Erreur suppression contenu', err)
      });
    }
  }

  submitForum(): void {
    if (!this.newForumTitle.trim()) return;

    const newForum: Forum = {
      title: this.newForumTitle,
      courseId: this.courseId,
      messages: []
    };

    this.forumService.createForum(newForum).subscribe({
      next: (forum: Forum) => {
        this.forums.push({ ...forum, newMessage: '' });
        this.newForumTitle = '';
        this.showForumModal = false;
      },
      error: (err: any) => console.error('Erreur création forum', err)
    });
  }

  sendMessageToForum(forum: Forum & { newMessage?: string }): void {
    const user = this.auth.getUser();
    if (!forum.newMessage?.trim() || !forum._id || !user) return;

    const message: Message = {
      author: `${user.surname} ${user.name}`,
      content: forum.newMessage,
      timestamp: new Date().toISOString()
    };

    this.forumService.addMessage(forum._id, message).subscribe({
      next: (updated: Forum) => {
        forum.messages = updated.messages;
        forum.newMessage = '';
      },
      error: (err: any) => console.error('Erreur envoi message', err)
    });
  }
}
