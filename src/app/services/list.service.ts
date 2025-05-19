import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { List } from '../models/list';
import { Person } from '../models/person';
import { GroupDraw } from '../models/group';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ListService {
  private lists: List[] = [];
  private listsSubject = new BehaviorSubject<List[]>([]);
  public lists$ = this.listsSubject.asObservable();

  constructor(private authService: AuthService) {
    this.loadLists();

    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.loadLists();
      } else {
        this.lists = [];
        this.listsSubject.next([]);
      }
    });
  }

  private loadLists(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    const storedLists = localStorage.getItem(`lists_${user.id}`);
    if (storedLists) {
      this.lists = JSON.parse(storedLists);
      this.listsSubject.next(this.lists);
    } else {
      this.lists = [];
      this.listsSubject.next([]);
    }
  }

  private saveLists(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    localStorage.setItem(`lists_${user.id}`, JSON.stringify(this.lists));
    this.listsSubject.next([...this.lists]);
  }

  getAllLists(): Observable<List[]> {
    return this.lists$;
  }

  getListById(id: number): Observable<List | undefined> {
    const list = this.lists.find((l) => l.id === id);
    return of(list);
  }

  createList(name: string): Observable<List> {
    const user = this.authService.currentUserValue;
    if (!user) throw new Error('User not authenticated');

    // Check if name is already used by this user
    if (this.lists.some((l) => l.name === name && l.userId === user.id)) {
      throw new Error('A list with this name already exists');
    }

    const newList: List = {
      id: Date.now(),
      name,
      userId: user.id,
      people: [],
      draws: [],
    };

    this.lists.push(newList);
    this.saveLists();
    return of(newList);
  }

  updateList(id: number, name: string): Observable<List> {
    const user = this.authService.currentUserValue;
    if (!user) throw new Error('User not authenticated');

    if (
      this.lists.some(
        (l) => l.name === name && l.userId === user.id && l.id !== id,
      )
    ) {
      throw new Error('A list with this name already exists');
    }

    const list = this.lists.find((l) => l.id === id);
    if (!list) throw new Error('List not found');

    list.name = name;
    this.saveLists();
    return of(list);
  }

  deleteList(id: number): Observable<boolean> {
    const initialLength = this.lists.length;
    this.lists = this.lists.filter((l) => l.id !== id);

    if (initialLength !== this.lists.length) {
      this.saveLists();
      return of(true);
    }
    return of(false);
  }

  addPerson(listId: number, person: Omit<Person, 'id'>): Observable<Person> {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) throw new Error('List not found');

    const newPerson: Person = {
      ...person,
      id: Date.now(),
    };

    list.people.push(newPerson);
    this.saveLists();
    return of(newPerson);
  }

  updatePerson(listId: number, person: Person): Observable<Person> {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) throw new Error('List not found');

    const personIndex = list.people.findIndex((p) => p.id === person.id);
    if (personIndex === -1) throw new Error('Person not found in list');

    list.people[personIndex] = { ...person };
    this.saveLists();
    return of(person);
  }

  deletePerson(listId: number, personId: number): Observable<boolean> {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) return of(false);

    const initialLength = list.people.length;
    list.people = list.people.filter((p) => p.id !== personId);

    if (initialLength !== list.people.length) {
      this.saveLists();
      return of(true);
    }
    return of(false);
  }

  saveGroupDraw(listId: number, draw: GroupDraw): Observable<GroupDraw> {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) throw new Error('List not found');

    const newDraw: GroupDraw = {
      ...draw,
      id: Date.now(),
      date: new Date(),
      listId,
    };

    list.draws.push(newDraw);
    this.saveLists();
    return of(newDraw);
  }

  getGroupDraws(listId: number): Observable<GroupDraw[]> {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) return of([]);

    return of(list.draws);
  }
}
