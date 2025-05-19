export enum Gender {
  MALE = 'masculin',
  FEMALE = 'féminin',
  NOT_SPECIFIED = 'ne se prononce pas',
}

export enum Profile {
  SHY = 'timide',
  RESERVED = 'réservé',
  COMFORTABLE = "à l'aise",
}

export interface Person {
  id: number;
  name: string;
  gender: Gender;
  frenchFluency: number;
  formerDWWM: boolean;
  technicalLevel: number;
  profile: Profile;
  age: number;
}
