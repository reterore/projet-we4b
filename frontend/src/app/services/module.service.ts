import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Module {
  _id?: string;
  courseId: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private apiUrl = 'http://localhost:3000/api/modules';

  constructor(private http: HttpClient) {}

  getModulesByCourse(courseId: string): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.apiUrl}/course/${courseId}`);
  }

  createModule(module: Module): Observable<Module> {
    return this.http.post<Module>('http://localhost:3000/api/modules', module);
  }
  updateModule(id: string, data: Partial<Module>) {
    return this.http.put<Module>(`${this.apiUrl}/${id}`, data);
  }

  deleteModule(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
