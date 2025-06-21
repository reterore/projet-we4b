import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Content } from './content.service'; //
export interface NewModule {
  title: string;
  courseId: string;
}

export interface Module extends NewModule {
  _id: string;
  contents?: Content[];
}

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private readonly apiUrl = 'http://localhost:3000/api/modules';
  private readonly progressUrl = 'http://localhost:3000/api/progress';

  constructor(private http: HttpClient) {}

  /** Obtenir tous les modules d’un cours */
  getModulesByCourse(courseId: string): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.apiUrl}/course/${courseId}`);
  }

  /** Créer un nouveau module */
  createModule(module: NewModule): Observable<Module> {
    return this.http.post<Module>(this.apiUrl, module);
  }

  /** Mettre à jour un module */
  updateModule(id: string, data: Partial<Module>): Observable<Module> {
    return this.http.put<Module>(`${this.apiUrl}/${id}`, data);
  }

  /** Supprimer un module */
  deleteModule(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /** Obtenir la progression de l’étudiant pour un module */
  getModuleProgress(studentId: string, moduleId: string): Observable<{
    total: number;
    seen: number;
    percentage: number;
  }> {
    return this.http.get<{ total: number; seen: number; percentage: number }>(
      `${this.progressUrl}/${studentId}/${moduleId}`
    );
  }
}
