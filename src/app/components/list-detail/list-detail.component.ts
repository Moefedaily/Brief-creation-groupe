// src/app/components/list-detail/list-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ListService } from '../../services/list.service';
import { List } from '../../models/list';
import { Person, Gender, Profile } from '../../models/person';

@Component({
  selector: 'app-list-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list-detail.component.html',
  styleUrls: ['./list-detail.component.scss'],
})
export class ListDetailComponent implements OnInit {
  list$!: Observable<List | undefined>;
  personForm!: FormGroup;
  showPersonForm = false;
  editingPerson: Person | null = null;
  errorMessage = '';
  listId!: number;

  genderOptions = Object.values(Gender);
  profileOptions = Object.values(Profile);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private listService: ListService,
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (isNaN(id)) {
        this.router.navigate(['/lists']);
        return;
      }
      this.listId = id;
      this.loadList();
    });
  }

  loadList(): void {
    // Update to use Observable
    this.list$ = this.listService.getListById(this.listId);
  }

  private initForm(): void {
    this.personForm = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      gender: [Gender.NOT_SPECIFIED, Validators.required],
      frenchFluency: [
        1,
        [Validators.required, Validators.min(1), Validators.max(4)],
      ],
      formerDWWM: [false, Validators.required],
      technicalLevel: [
        1,
        [Validators.required, Validators.min(1), Validators.max(4)],
      ],
      profile: [Profile.RESERVED, Validators.required],
      age: [18, [Validators.required, Validators.min(1), Validators.max(99)]],
    });
  }

  get f() {
    return this.personForm.controls;
  }

  togglePersonForm(person?: Person): void {
    this.showPersonForm = !this.showPersonForm;

    if (this.showPersonForm) {
      this.errorMessage = '';

      if (person) {
        this.editingPerson = person;
        this.personForm.patchValue(person);
      } else {
        this.editingPerson = null;
        this.personForm.reset({
          gender: Gender.NOT_SPECIFIED,
          frenchFluency: 1,
          formerDWWM: false,
          technicalLevel: 1,
          profile: Profile.RESERVED,
          age: 18,
        });
      }
    }
  }

  onSubmit(): void {
    if (this.personForm.invalid) {
      return;
    }

    try {
      if (this.editingPerson) {
        // Update existing person
        const updatedPerson: Person = {
          ...this.editingPerson,
          ...this.personForm.value,
        };

        this.listService.updatePerson(this.listId, updatedPerson).subscribe({
          next: () => {
            this.loadList();
            this.togglePersonForm();
          },
          error: (error) => {
            this.errorMessage = error.message;
          },
        });
      } else {
        // Add new person
        this.listService
          .addPerson(this.listId, this.personForm.value)
          .subscribe({
            next: () => {
              this.loadList();
              this.togglePersonForm();
            },
            error: (error) => {
              this.errorMessage = error.message;
            },
          });
      }
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  deletePerson(person: Person): void {
    if (
      confirm(`Are you sure you want to remove ${person.name} from this list?`)
    ) {
      this.listService.deletePerson(this.listId, person.id).subscribe({
        next: () => {
          this.loadList();
        },
        error: (error) => {
          this.errorMessage = error.message;
        },
      });
    }
  }

  generateGroups(): void {
    this.router.navigate(['/lists', this.listId, 'generate']);
  }

  goBack(): void {
    this.router.navigate(['/lists']);
  }
}
