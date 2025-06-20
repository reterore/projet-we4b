import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService, Content } from 'src/app/services/content.service';
import { ModuleService, Module, NewModule } from 'src/app/services/module.service';
import { AuthService } from 'src/app/services/auth.service';
import { CourseService, Course } from 'src/app/services/course.service';
import { ForumService, Forum, Message } from 'src/app/services/forum.service';
import { Assignment, AssignmentService, Submission } from 'src/app/services/assignment.service';
declare var bootstrap: any;

type SubmissionWithTemp = Submission & {
  tempGrade?: number;
  tempComment?: string;
};

type AssignmentWithTemp = Assignment & {
  submissions?: SubmissionWithTemp[];
};

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

  assignments: AssignmentWithTemp[] = [];
  selectedAssignmentFile: File | null = null;
  showAddAssignmentModal = false;

  forums: (Forum & { newMessage?: string })[] = [];
  newForumTitle = '';

  showForumModal = false;

  newAssignmentTitle = '';
  newAssignmentDescription = '';
  newAssignmentDueDate: string = '';

  selectedUpdateFile: File | null = null;
  selectedAssignmentId: string | null = null;
  selectedSubmissionId: string | null = null;
  editedFile: File | null = null;


  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService,
    private moduleService: ModuleService,
    private courseService: CourseService,
    public auth: AuthService,
    private router: Router,
    private forumService: ForumService,
    private assignmentService: AssignmentService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    const user = this.auth.getUser();
    this.isProf = user?.role === 'teacher';

    this.courseService.getCourse(this.courseId).subscribe({
      next: c => this.course = c,
      error: err => {
        console.error('Erreur chargement cours', err);
        this.router.navigate(['/dashboard']);
      }
    });

    this.assignmentService.getAssignmentsByCourse(this.courseId).subscribe({
      next: (a) => {
        this.assignments = a.map(assign => ({
          ...assign,
          submissions: assign.submissions?.map(sub => ({
            ...sub,
            tempGrade: undefined,
            tempComment: ''
          }))
        }));
      },
      error: (err) => console.error('Erreur chargement devoirs', err)
    });

    this.moduleService.getModulesByCourse(this.courseId).subscribe(mods => {
      this.modules = mods;
      this.loadContentsForModules();
    });

    this.forumService.getForumsByCourse(this.courseId).subscribe({
      next: forums => this.forums = forums,
      error: err => console.error('Erreur chargement forums', err)
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedUpdateFile = input.files[0];
    }
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

  updateSubmission(assignmentId: string, submissionId: string) {
    if (!this.selectedUpdateFile) {
      alert("❌ Aucune mise à jour de² fichier sélectionnée.");
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedUpdateFile);

    this.assignmentService.updateSubmission(assignmentId, submissionId, formData).subscribe({
      next: () => {
        alert('✅ Soumission mise à jour.');
        this.ngOnInit(); // recharge les données
      },
      error: err => {
        console.error('Erreur update soumission', err);
        alert('❌ Échec de mise à jour.');
      }
    });
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

  gradeSubmission(assignmentId: string, submission: any) {
    const grade = Number(submission.tempGrade);
    const comment = submission.tempComment;

    // Vérification de la validité de la note
    if (isNaN(grade) || grade < 0 || grade > 20) {
      alert("❌ Note invalide. Elle doit être comprise entre 0 et 20.");
      return;
    }

    this.assignmentService.gradeSubmission(assignmentId, submission._id, {
      grade,
      comment
    }).subscribe({
      next: () => {
        alert('✅ Note enregistrée avec succès.');
        // Rafraîchir les devoirs après notation
        this.assignmentService.getAssignmentsByCourse(this.courseId).subscribe({
          next: (a) => this.assignments = a
        });
      },
      error: err => {
        console.error('Erreur enregistrement note', err);
        alert('❌ Erreur lors de l\'enregistrement de la note.');
      }
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
  onAssignmentFileSelected(event: any) {
    this.selectedAssignmentFile = event.target.files[0];
  }

  submitAssignment(assignmentId: string) {
    if (!this.selectedAssignmentFile) return;

    const formData = new FormData();
    formData.append('studentId', this.auth.getUser()._id);
    formData.append('studentName', `${this.auth.getUser().surname} ${this.auth.getUser().name}`);
    formData.append('file', this.selectedAssignmentFile);

    this.assignmentService.submitAssignment(assignmentId, formData).subscribe({
      next: () => {
        alert('✅ Devoir soumis avec succès');
        this.selectedAssignmentFile = null;
        // Rechargement pour afficher la soumission
        this.assignmentService.getAssignmentsByCourse(this.courseId).subscribe({
          next: (a) => this.assignments = a
        });
      },
      error: (err) => {
        console.error('Erreur soumission devoir', err);
        alert('❌ Échec de la soumission');
      }
    });
  }
  cancelAddAssignment() {
    this.showAddAssignmentModal = false;
    this.newAssignmentTitle = '';
    this.newAssignmentDescription = '';
    this.newAssignmentDueDate = '';
  }

  submitNewAssignment() {
    if (!this.newAssignmentTitle.trim() || !this.newAssignmentDueDate) return;

    const newAssignment = {
      title: this.newAssignmentTitle.trim(),
      description: this.newAssignmentDescription.trim(),
      dueDate: this.newAssignmentDueDate,
      courseId: this.courseId
    };

    this.assignmentService.createAssignment(newAssignment).subscribe({
      next: (created) => {
        this.assignments.push(created);
        this.cancelAddAssignment();
        alert('✅ Devoir créé avec succès.');
      },
      error: (err) => {
        console.error('Erreur création devoir', err);
        alert('❌ Erreur lors de la création du devoir.');
      }
    });

  }
  deleteAssignment(assignmentId: string) {
    if (!confirm('Voulez-vous vraiment supprimer ce devoir ?')) return;

    this.assignmentService.deleteAssignment(assignmentId).subscribe({
      next: () => {
        this.assignments = this.assignments.filter(a => a._id !== assignmentId);
        alert('✅ Devoir supprimé avec succès.');
      },
      error: (err) => {
        console.error('Erreur suppression devoir', err);
        alert('❌ Échec de la suppression.');
      }
    });
  }
  openEditModal(assignmentId: string, submissionId: string) {
    this.selectedAssignmentId = assignmentId;
    this.selectedSubmissionId = submissionId;
    this.editedFile = null;

    const modal = document.getElementById('editSubmissionModal');
    if (modal) new bootstrap.Modal(modal).show();
  }

  onEditFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.editedFile = input.files[0];
    }
  }

  confirmEditSubmission() {
    if (!this.selectedAssignmentId || !this.selectedSubmissionId || !this.editedFile) return;

    const formData = new FormData();
    formData.append('file', this.editedFile);

    this.assignmentService.updateSubmission(this.selectedAssignmentId, this.selectedSubmissionId, formData)
      .subscribe({
        next: () => {
          alert('✅ Fichier mis à jour avec succès');
          window.location.reload(); // ou rafraîchissement partiel
        },
        error: () => alert('❌ Échec de la mise à jour.')
      });

    const modal = document.getElementById('editSubmissionModal');
    if (modal) bootstrap.Modal.getInstance(modal)?.hide();
  }


}
