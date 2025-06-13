import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentService, Content } from 'src/app/services/content.service';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {
  contents: Content[] = [];
  courseId!: string;

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    this.contentService.getContentsByCourse(this.courseId).subscribe({
      next: contents => this.contents = contents,
      error: err => console.error('Erreur chargement contenus', err)
    });
  }
}
