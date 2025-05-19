// src/app/services/list.service.ts (Simplified)
import { Injectable } from '@angular/core';
import { List } from '../models/list';
import { Person } from '../models/person';
import { GroupDraw } from '../models/group';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ListService {
  private lists: List[] = [];

  constructor(private authService: AuthService) {
    this.loadLists();
  }

  private loadLists(): void {
    if (!this.authService.isLoggedIn()) return;

    const user = this.authService.getCurrentUser();
    if (!user) return;

    const storedLists = localStorage.getItem(`lists_${user.id}`);
    if (storedLists) {
      this.lists = JSON.parse(storedLists);
    } else {
      this.lists = [];
    }
  }

  private saveLists(): void {
    if (!this.authService.isLoggedIn()) return;

    const user = this.authService.getCurrentUser();
    if (!user) return;

    localStorage.setItem(`lists_${user.id}`, JSON.stringify(this.lists));
  }

  getAllLists(): List[] {
    this.loadLists();
    return [...this.lists];
  }

  getListById(id: number): List | undefined {
    this.loadLists();
    return this.lists.find((l) => l.id === id);
  }

  createList(name: string): List {
    if (!this.authService.isLoggedIn()) {
      throw new Error('User not authenticated');
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

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
    return { ...newList };
  }

  updateList(id: number, name: string): List {
    if (!this.authService.isLoggedIn()) {
      throw new Error('User not authenticated');
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (
      this.lists.some(
        (l) => l.name === name && l.userId === user.id && l.id !== id,
      )
    ) {
      throw new Error('A list with this name already exists');
    }

    const list = this.lists.find((l) => l.id === id);
    if (!list) {
      throw new Error('List not found');
    }

    list.name = name;
    this.saveLists();
    return { ...list };
  }

  deleteList(id: number): boolean {
    const initialLength = this.lists.length;
    this.lists = this.lists.filter((l) => l.id !== id);

    if (initialLength !== this.lists.length) {
      this.saveLists();
      return true;
    }
    return false;
  }

  addPerson(listId: number, person: Omit<Person, 'id'>): Person {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) {
      throw new Error('List not found');
    }

    const newPerson: Person = {
      ...person,
      id: Date.now(),
    };

    list.people.push(newPerson);
    this.saveLists();
    return { ...newPerson };
  }

  updatePerson(listId: number, person: Person): Person {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) {
      throw new Error('List not found');
    }

    const personIndex = list.people.findIndex((p) => p.id === person.id);
    if (personIndex === -1) {
      throw new Error('Person not found in list');
    }

    list.people[personIndex] = { ...person };
    this.saveLists();
    return { ...person };
  }

  deletePerson(listId: number, personId: number): boolean {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) return false;

    const initialLength = list.people.length;
    list.people = list.people.filter((p) => p.id !== personId);

    if (initialLength !== list.people.length) {
      this.saveLists();
      return true;
    }
    return false;
  }

  saveGroupDraw(listId: number, draw: GroupDraw): GroupDraw {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) {
      throw new Error('List not found');
    }

    const newDraw: GroupDraw = {
      ...draw,
      id: Date.now(),
      date: new Date(),
      listId,
    };

    list.draws.push(newDraw);
    this.saveLists();
    return { ...newDraw };
  }

  getGroupDraws(listId: number): GroupDraw[] {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) return [];

    return [...list.draws];
  }
}
