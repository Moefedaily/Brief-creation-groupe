import { Injectable } from '@angular/core';
import { Person } from '../models/person';
import { Group, GroupDraw, MixCriteria } from '../models/group';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  constructor() {}

  generateGroups(
    people: Person[],
    numberOfGroups: number,
    groupNames: string[],
    criteria: MixCriteria,
    previousDraws: GroupDraw[],
  ): Group[] {
    if (numberOfGroups > people.length) {
      throw new Error('Number of groups cannot exceed number of people');
    }

    if (groupNames.length !== numberOfGroups) {
      throw new Error('Number of group names must match number of groups');
    }

    const shufflePeople = [...people];

    if (Object.values(criteria).some((value) => value)) {
      this.sortByCriteria(shufflePeople, criteria);
    }

    this.shuffleAvoidingPreviousCombinations(shufflePeople, previousDraws);

    const groups: Group[] = [];
    const peoplePerGroup = Math.floor(people.length / numberOfGroups);
    const extraPeople = people.length % numberOfGroups;

    let currentIndex = 0;

    for (let i = 0; i < numberOfGroups; i++) {
      const countForThisGroup = peoplePerGroup + (i < extraPeople ? 1 : 0);

      const group: Group = {
        id: Date.now() + i,
        name: groupNames[i],
        people: shufflePeople.slice(
          currentIndex,
          currentIndex + countForThisGroup,
        ),
      };

      groups.push(group);
      currentIndex += countForThisGroup;
    }

    return groups;
  }

  private sortByCriteria(people: Person[], criteria: MixCriteria): void {
    people.sort((a, b) => {
      let score = 0;

      if (criteria.mixGender && a.gender !== b.gender) {
        score += a.gender < b.gender ? -1 : 1;
      }

      if (criteria.mixFrenchFluency && a.frenchFluency !== b.frenchFluency) {
        score += a.frenchFluency - b.frenchFluency;
      }

      if (criteria.mixFormerDWWM && a.formerDWWM !== b.formerDWWM) {
        score += a.formerDWWM ? -1 : 1;
      }

      if (criteria.mixTechnicalLevel && a.technicalLevel !== b.technicalLevel) {
        score += a.technicalLevel - b.technicalLevel;
      }

      if (criteria.mixProfile && a.profile !== b.profile) {
        score += a.profile < b.profile ? -1 : 1;
      }

      if (criteria.mixAge && a.age !== b.age) {
        score += a.age - b.age;
      }

      return score;
    });
  }

  private shuffleAvoidingPreviousCombinations(
    people: Person[],
    previousDraws: GroupDraw[],
  ): void {
    const previousPairs = this.extractPreviousPairs(previousDraws);

    for (let i = people.length - 1; i > 0; i--) {
      let attempts = 0;
      let swapped = false;

      while (attempts < 10 && !swapped) {
        const j = Math.floor(Math.random() * (i + 1));

        if (this.wouldCreatePreviousPair(people, i, j, previousPairs)) {
          attempts++;
          continue;
        }

        [people[i], people[j]] = [people[j], people[i]];
        swapped = true;
      }

      if (!swapped) {
        const j = Math.floor(Math.random() * (i + 1));
        [people[i], people[j]] = [people[j], people[i]];
      }
    }
  }

  private extractPreviousPairs(
    previousDraws: GroupDraw[],
  ): Map<number, Set<number>> {
    const pairs = new Map<number, Set<number>>();

    for (const draw of previousDraws) {
      for (const group of draw.groups) {
        for (let i = 0; i < group.people.length; i++) {
          for (let j = i + 1; j < group.people.length; j++) {
            const person1Id = group.people[i].id;
            const person2Id = group.people[j].id;

            if (!pairs.has(person1Id)) pairs.set(person1Id, new Set<number>());
            pairs.get(person1Id)!.add(person2Id);

            if (!pairs.has(person2Id)) pairs.set(person2Id, new Set<number>());
            pairs.get(person2Id)!.add(person1Id);
          }
        }
      }
    }

    return pairs;
  }

  private wouldCreatePreviousPair(
    people: Person[],
    pos1: number,
    pos2: number,
    previousPairs: Map<number, Set<number>>,
  ): boolean {
    const id1 = people[pos1].id;
    const id2 = people[pos2].id;

    if (pos1 > 0 && previousPairs.has(people[pos1 - 1].id)) {
      const pairs = previousPairs.get(people[pos1 - 1].id)!;
      if (pairs.has(id2)) return true;
    }

    if (pos1 < people.length - 1 && previousPairs.has(people[pos1 + 1].id)) {
      const pairs = previousPairs.get(people[pos1 + 1].id)!;
      if (pairs.has(id2)) return true;
    }

    if (pos2 > 0 && previousPairs.has(people[pos2 - 1].id)) {
      const pairs = previousPairs.get(people[pos2 - 1].id)!;
      if (pairs.has(id1)) return true;
    }

    if (pos2 < people.length - 1 && previousPairs.has(people[pos2 + 1].id)) {
      const pairs = previousPairs.get(people[pos2 + 1].id)!;
      if (pairs.has(id1)) return true;
    }

    return false;
  }

  validateGroupMixing(groups: Group[], criteria: MixCriteria): boolean {
    if (groups.length <= 1) return true;

    if (criteria.mixGender) {
      const genderDistribution = this.checkDistribution(
        groups,
        (p) => p.gender,
      );
      if (!genderDistribution) return false;
    }

    if (criteria.mixFrenchFluency) {
      const fluencyDistribution = this.checkDistribution(groups, (p) =>
        p.frenchFluency.toString(),
      );
      if (!fluencyDistribution) return false;
    }

    if (criteria.mixFormerDWWM) {
      const dwwmDistribution = this.checkDistribution(groups, (p) =>
        p.formerDWWM ? 'yes' : 'no',
      );
      if (!dwwmDistribution) return false;
    }

    if (criteria.mixTechnicalLevel) {
      const techDistribution = this.checkDistribution(groups, (p) =>
        p.technicalLevel.toString(),
      );
      if (!techDistribution) return false;
    }

    if (criteria.mixProfile) {
      const profileDistribution = this.checkDistribution(
        groups,
        (p) => p.profile,
      );
      if (!profileDistribution) return false;
    }

    if (criteria.mixAge) {
      const ageDistribution = this.checkDistribution(groups, (p) => {
        if (p.age < 25) return '<25';
        if (p.age <= 35) return '25-35';
        if (p.age <= 45) return '36-45';
        return '>45';
      });
      if (!ageDistribution) return false;
    }

    return true;
  }
  private checkDistribution(
    groups: Group[],
    propertyExtractor: (p: Person) => string,
  ): boolean {
    const groupDistributions: Map<string, number>[] = groups.map(
      () => new Map<string, number>(),
    );

    const totalDistribution = new Map<string, number>();

    groups.forEach((group, groupIndex) => {
      group.people.forEach((person) => {
        const value = propertyExtractor(person);

        const currentGroupCount =
          groupDistributions[groupIndex].get(value) || 0;
        groupDistributions[groupIndex].set(value, currentGroupCount + 1);

        const currentTotalCount = totalDistribution.get(value) || 0;
        totalDistribution.set(value, currentTotalCount + 1);
      });
    });

    for (const [value, totalCount] of totalDistribution.entries()) {
      if (totalCount <= 1) continue;

      const idealPerGroup = totalCount / groups.length;

      const maxDeviation = Math.max(1, Math.floor(idealPerGroup * 0.5));

      let isWellDistributed = true;
      for (const distribution of groupDistributions) {
        const count = distribution.get(value) || 0;
        if (Math.abs(count - idealPerGroup) > maxDeviation) {
          isWellDistributed = false;
          break;
        }
      }

      if (!isWellDistributed) return false;
    }

    return true;
  }
}
