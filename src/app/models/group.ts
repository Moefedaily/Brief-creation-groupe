import { Person } from './person'; // Add this import

export interface Group {
  id: number;
  name: string;
  people: Person[];
}

export interface GroupDraw {
  id: number;
  date: Date;
  listId: number;
  groups: Group[];
  criteria: MixCriteria;
}

export interface MixCriteria {
  mixGender: boolean;
  mixFrenchFluency: boolean;
  mixFormerDWWM: boolean;
  mixTechnicalLevel: boolean;
  mixProfile: boolean;
  mixAge: boolean;
}
