import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  list: List | undefined;
  personForm: FormGroup;
  showPersonForm = false;
  editingPerson: Person | null = null;
  errorMessage = '';
  listId!: number;
  isLoading = true;

  genderOptions = Object.values(Gender);
  profileOptions = Object.values(Profile);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listService: ListService
  ) {
    this.personForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      gender: new FormControl(Gender.NOT_SPECIFIED, [Validators.required]),
      frenchFluency: new FormControl(1, [
        Validators.required,
        Validators.min(1),
        Validators.max(4),
      ]),
      formerDWWM: new FormControl(false, [Validators.required]),
      technicalLevel: new FormControl(1, [
        Validators.required,
        Validators.min(1),
        Validators.max(4),
      ]),
      profile: new FormControl(Profile.RESERVED, [Validators.required]),
      age: new FormControl(18, [
        Validators.required,
        Validators.min(1),
        Validators.max(99),
      ]),
    });
  }

  ngOnInit(): void {
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
    try {
      this.isLoading = true;
      this.list = this.listService.getListById(this.listId);
      this.isLoading = false;

      if (!this.list) {
        this.router.navigate(['/lists']);
      }
    } catch (error: any) {
      this.errorMessage = error.message;
      this.isLoading = false;
    }
  }

  togglePersonForm(person?: Person): void {
    this.showPersonForm = !this.showPersonForm;

    if (this.showPersonForm) {
      this.errorMessage = '';

      if (person) {
        this.editingPerson = person;
        this.personForm.setValue({
          name: person.name,
          gender: person.gender,
          frenchFluency: person.frenchFluency,
          formerDWWM: person.formerDWWM,
          technicalLevel: person.technicalLevel,
          profile: person.profile,
          age: person.age,
        });
      } else {
        this.editingPerson = null;
        this.personForm.setValue({
          name: '',
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
      const personData = {
        name: this.personForm.get('name')?.value,
        gender: this.personForm.get('gender')?.value,
        frenchFluency: this.personForm.get('frenchFluency')?.value,
        formerDWWM: this.personForm.get('formerDWWM')?.value,
        technicalLevel: this.personForm.get('technicalLevel')?.value,
        profile: this.personForm.get('profile')?.value,
        age: this.personForm.get('age')?.value,
      };

      if (this.editingPerson) {
        const updatedPerson: Person = {
          ...this.editingPerson,
          ...personData,
        };

        this.listService.updatePerson(this.listId, updatedPerson);
        this.loadList();
        this.togglePersonForm();
      } else {
        this.listService.addPerson(this.listId, personData);
        this.loadList();
        this.togglePersonForm();
      }
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  deletePerson(person: Person): void {
    if (
      confirm(`Are you sure you want to remove ${person.name} from this list?`)
    ) {
      try {
        this.listService.deletePerson(this.listId, person.id);
        this.loadList();
      } catch (error: any) {
        this.errorMessage = error.message;
      }
    }
  }

  generateGroups(): void {
    this.router.navigate(['/lists', this.listId, 'generate']);
  }

  goBack(): void {
    this.router.navigate(['/lists']);
  }
}
