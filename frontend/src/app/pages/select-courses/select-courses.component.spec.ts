import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCoursesComponent } from './select-courses.component';

describe('SelectCoursesComponent', () => {
  let component: SelectCoursesComponent;
  let fixture: ComponentFixture<SelectCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectCoursesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
