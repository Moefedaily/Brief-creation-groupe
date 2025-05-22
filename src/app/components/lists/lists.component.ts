import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ListService } from '../../services/list.service';
import { List } from '../../models/list';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss'],
})
export class ListsComponent implements OnInit {
  lists: List[] = [];
  newListForm: FormGroup;
  showNewListForm = false;
  errorMessage = '';
  isLoading = true;

  constructor(private listService: ListService, private router: Router) {
    this.newListForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
    });
  }

  ngOnInit(): void {
    this.loadLists();
  }

  loadLists(): void {
    try {
      this.isLoading = true;
      this.lists = this.listService.getAllLists();
      this.isLoading = false;
    } catch (error: any) {
      this.errorMessage = error.message;
      this.isLoading = false;
    }
  }

  toggleNewListForm(): void {
    this.showNewListForm = !this.showNewListForm;
    if (this.showNewListForm) {
      this.newListForm.reset();
      this.errorMessage = '';
    }
  }

  onSubmit(): void {
    if (this.newListForm.invalid) {
      return;
    }

    try {
      const name = this.newListForm.get('name')?.value;
      this.listService.createList(name);
      this.loadLists();
      this.toggleNewListForm();
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  viewList(listId: number): void {
    this.router.navigate(['/lists', listId]);
  }

  deleteList(event: Event, listId: number): void {
    event.stopPropagation();
    if (
      confirm(
        'Are you sure you want to delete this list? This action cannot be undone.'
      )
    ) {
      try {
        const success = this.listService.deleteList(listId);
        if (success) {
          this.loadLists();
        } else {
          this.errorMessage = 'Failed to delete the list';
        }
      } catch (error: any) {
        this.errorMessage = error.message;
      }
    }
  }
}
