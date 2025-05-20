import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPreviewComponent } from './list-preview.component';

describe('ListPreviewComponent', () => {
  let component: ListPreviewComponent;
  let fixture: ComponentFixture<ListPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
