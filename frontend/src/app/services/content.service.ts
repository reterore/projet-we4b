import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Content {
  _id: string;
  title: string;
  type: 'text' | 'file';
  text?: string;
  file?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
  };
  moduleId: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private readonly apiUrl = 'http://localhost:3000/api/contents';
  private readonly progressUrl = 'http://localhost:3000/api/progress';

  constructor(private http: HttpClient) {}

  /** 📥 Récupère tous les contenus d’un module */
  getContentsByModule(moduleId: string): Observable<Content[]> {
    return this.http.get<Content[]>(`${this.apiUrl}/module/${moduleId}`);
  }

  /** 📥 (Facultatif) Récupère tous les contenus d’un cours */
  getContentsByCourse(courseId: string): Observable<Content[]> {
    return this.http.get<Content[]>(`${this.apiUrl}/course/${courseId}`);
  }

  /** ➕ Ajoute un contenu (texte ou fichier via FormData) */
  addContent(formData: FormData): Observable<Content> {
    return this.http.post<Content>(this.apiUrl, formData);
  }

  /** ❌ Supprime un contenu par son ID */
  deleteContent(contentId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${contentId}`);
  }

  /** ✏️ Met à jour un contenu texte */
  updateContent(contentId: string, data: { title: string; text: string }): Observable<Content> {
    return this.http.put<Content>(`${this.apiUrl}/${contentId}`, data);
  }

  /** ✅ Marque un contenu comme vu */
  markAsViewed(studentId: string, contentId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.progressUrl}/view`, { studentId, contentId });
  }

  /** 👁️ Vérifie si un contenu a été vu */
  isContentViewed(studentId: string, contentId: string): Observable<{ isViewed: boolean }> {
    return this.http.get<{ isViewed: boolean }>(`${this.progressUrl}/check/${studentId}/${contentId}`);
  }

  getCourseProgress(studentId: string, courseId: string) {
    return this.http.get<{ percentage: number }>(
      `http://localhost:3000/api/progress/${studentId}/${courseId}`
    );
  }
}
