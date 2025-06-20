import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService, Content } from 'src/app/services/content.service';
import { ModuleService, Module, NewModule } from 'src/app/services/module.service';
import { AuthService } from 'src/app/services/auth.service';
import { CourseService, Course } from 'src/app/services/course.service';
import { ForumService, Forum, Message } from 'src/app/services/forum.service';
import { LogService } from 'src/app/services/log.service';

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
    private forumService: ForumService,
    private logService: LogService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    const user = this.auth.getUser();
    this.isProf = user?.role === 'teacher';

    this.courseService.getCourse(this.courseId).subscribe({
      next: c => {
        this.course = c;

        // ✅ Log consultation de cours
        const user = this.auth.getUser();
        if (user && c._id) {
          this.logService.sendLog({
            userId: user._id,
            action: 'course_view',
            details: {
              email: user.email,
              role: user.role,
              courseId: c._id,
              courseTitle: c.title,
              time: new Date().toISOString()
            }
          }).subscribe({
            error: err => console.warn('⚠️ Erreur log consultation cours :', err)
          });
        }
      },
      error: err => {
        console.error('Erreur chargement cours', err);
        this.router.navigate(['/dashboard']);
      }
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
        next: contents => module.contents = contents,
        error: err => console.error(`Erreur chargement contenus du module ${module._id}`, err)
      });
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  submitContent() {
    if (!this.currentModuleId || !this.newContentTitle) return;

    const formData = new FormData();
    formData.append('title', this.newContentTitle);
    formData.append('type', this.newContentType);
    formData.append('moduleId', this.currentModuleId);

    if (this.newContentType === 'text') {
      formData.append('text', this.newContentText);
    } else if (this.newContentType === 'file') {
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      } else {
        return;
      }
    }

    this.contentService.addContent(formData).subscribe({
      next: content => {
        const mod = this.modules.find(m => m._id === content.moduleId);
        if (mod) {
          if (!mod.contents) mod.contents = [];
          mod.contents.push(content);
        }
        this.cancelAddContent();
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

  submitForum() {
    if (!this.newForumTitle.trim()) return;

    const newForum: Forum = {
      title: this.newForumTitle,
      courseId: this.courseId,
      messages: []
    };

    this.forumService.createForum(newForum).subscribe({
      next: forum => {
        this.forums.push({ ...forum, newMessage: '' });
        this.newForumTitle = '';
        this.showForumModal = false;
      },
      error: err => console.error('Erreur création forum', err)
    });
  }


  sendMessageToForum(forum: Forum & { newMessage?: string }) {
    const user = this.auth.getUser();
    if (!forum.newMessage?.trim() || !forum._id) return;

    const message: Message = {
      author: `${user?.surname} ${user?.name}`,
      content: forum.newMessage,
      timestamp: new Date().toISOString()
    };

    this.forumService.addMessage(forum._id, message).subscribe({
      next: updated => {
        forum.messages = updated.messages;
        forum.newMessage = '';
      },
      error: err => console.error('Erreur envoi message', err)
    });
  }
}
