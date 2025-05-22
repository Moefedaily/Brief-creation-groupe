import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ListService } from '../../services/list.service';
import { GroupService } from '../../services/group.service';
import { List } from '../../models/list';
import { Group, GroupDraw, MixCriteria } from '../../models/group';
import { Person } from '../../models/person';

@Component({
  selector: 'app-group-generator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './group-generator.component.html',
  styleUrls: ['./group-generator.component.scss'],
})
export class GroupGeneratorComponent implements OnInit {
  list: List | undefined;
  isLoading = true;
  listId!: number;
  generatorForm: FormGroup;
  groupsForm: FormGroup;
  generatedGroups: Group[] = [];
  showGroups = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listService: ListService,
    private groupService: GroupService
  ) {
    this.generatorForm = new FormGroup({
      numberOfGroups: new FormControl(2, [
        Validators.required,
        Validators.min(2),
      ]),
      mixGender: new FormControl(false),
      mixFrenchFluency: new FormControl(false),
      mixFormerDWWM: new FormControl(false),
      mixTechnicalLevel: new FormControl(false),
      mixProfile: new FormControl(false),
      mixAge: new FormControl(false),
    });

    this.groupsForm = new FormGroup({
      groupNames: new FormArray([]),
    });

    this.createGroupNamesFormArray(2);
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

  get groupNames() {
    return this.groupsForm.get('groupNames') as FormArray;
  }

  onNumberOfGroupsChange(): void {
    const numberOfGroups = this.generatorForm.get('numberOfGroups')?.value;
    this.createGroupNamesFormArray(numberOfGroups);
  }

  private createGroupNamesFormArray(count: number): void {
    while ((this.groupsForm.get('groupNames') as FormArray).length) {
      (this.groupsForm.get('groupNames') as FormArray).removeAt(0);
    }

    for (let i = 0; i < count; i++) {
      (this.groupsForm.get('groupNames') as FormArray).push(
        new FormControl(`Group ${i + 1}`, [Validators.required])
      );
    }
  }

  onGenerateGroups(): void {
    if (this.generatorForm.invalid || this.groupsForm.invalid || !this.list) {
      return;
    }

    const numberOfGroups = this.generatorForm.get('numberOfGroups')?.value;

    if (this.list.people.length < numberOfGroups) {
      this.errorMessage = `Cannot create ${numberOfGroups} groups with only ${this.list.people.length} people.`;
      return;
    }

    const groupNames = (this.groupsForm.get('groupNames') as FormArray).value;

    const criteria: MixCriteria = {
      mixGender: this.generatorForm.get('mixGender')?.value,
      mixFrenchFluency: this.generatorForm.get('mixFrenchFluency')?.value,
      mixFormerDWWM: this.generatorForm.get('mixFormerDWWM')?.value,
      mixTechnicalLevel: this.generatorForm.get('mixTechnicalLevel')?.value,
      mixProfile: this.generatorForm.get('mixProfile')?.value,
      mixAge: this.generatorForm.get('mixAge')?.value,
    };

    try {
      this.generatedGroups = this.groupService.generateGroups(
        this.list.people,
        numberOfGroups,
        groupNames,
        criteria,
        this.list.draws
      );

      this.showGroups = true;
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  regenerateGroups(): void {
    this.onGenerateGroups();
  }

  saveGroups(): void {
    if (!this.list) return;

    const draw: GroupDraw = {
      id: 0,
      date: new Date(),
      listId: this.listId,
      groups: this.generatedGroups,
      criteria: {
        mixGender: this.generatorForm.get('mixGender')?.value,
        mixFrenchFluency: this.generatorForm.get('mixFrenchFluency')?.value,
        mixFormerDWWM: this.generatorForm.get('mixFormerDWWM')?.value,
        mixTechnicalLevel: this.generatorForm.get('mixTechnicalLevel')?.value,
        mixProfile: this.generatorForm.get('mixProfile')?.value,
        mixAge: this.generatorForm.get('mixAge')?.value,
      },
    };

    try {
      this.listService.saveGroupDraw(this.listId, draw);
      this.router.navigate(['/lists', this.listId]);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  onDrop(event: CdkDragDrop<Person[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  getConnectedGroupIds(): string[] {
    return this.generatedGroups.map((_, i) => `group-${i}`);
  }

  goBack(): void {
    this.router.navigate(['/lists', this.listId]);
  }
}
