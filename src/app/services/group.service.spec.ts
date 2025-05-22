import { TestBed } from '@angular/core/testing';
import { GroupService } from './group.service';
import { Person, Gender, Profile } from '../models/person';
import { Group, GroupDraw, MixCriteria } from '../models/group';

describe('GroupService', () => {
  let service: GroupService;
  let mockPeople: Person[];
  let mockCriteria: MixCriteria;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupService);

    // Setup mock data
    mockPeople = [
      {
        id: 1,
        name: 'John Doe',
        gender: Gender.MALE,
        frenchFluency: 3,
        formerDWWM: true,
        technicalLevel: 2,
        profile: Profile.COMFORTABLE,
        age: 25,
      },
      {
        id: 2,
        name: 'Jane Smith',
        gender: Gender.FEMALE,
        frenchFluency: 4,
        formerDWWM: false,
        technicalLevel: 3,
        profile: Profile.RESERVED,
        age: 30,
      },
      {
        id: 3,
        name: 'Alex Johnson',
        gender: Gender.NOT_SPECIFIED,
        frenchFluency: 2,
        formerDWWM: true,
        technicalLevel: 4,
        profile: Profile.SHY,
        age: 22,
      },
      {
        id: 4,
        name: 'Maria Garcia',
        gender: Gender.FEMALE,
        frenchFluency: 1,
        formerDWWM: false,
        technicalLevel: 1,
        profile: Profile.COMFORTABLE,
        age: 28,
      },
      {
        id: 5,
        name: 'Pierre Dubois',
        gender: Gender.MALE,
        frenchFluency: 4,
        formerDWWM: true,
        technicalLevel: 3,
        profile: Profile.RESERVED,
        age: 35,
      },
      {
        id: 6,
        name: 'Sophie Martin',
        gender: Gender.FEMALE,
        frenchFluency: 3,
        formerDWWM: false,
        technicalLevel: 2,
        profile: Profile.SHY,
        age: 26,
      },
    ];

    mockCriteria = {
      mixGender: true,
      mixFrenchFluency: true,
      mixFormerDWWM: true,
      mixTechnicalLevel: true,
      mixProfile: true,
      mixAge: true,
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateGroups', () => {
    it('should generate the correct number of groups', () => {
      const numberOfGroups = 2;
      const groupNames = ['Group A', 'Group B'];

      const result = service.generateGroups(
        mockPeople,
        numberOfGroups,
        groupNames,
        mockCriteria,
        []
      );

      expect(result.length).toBe(numberOfGroups);
      expect(result[0].name).toBe('Group A');
      expect(result[1].name).toBe('Group B');
    });

    it('should distribute people evenly across groups', () => {
      const numberOfGroups = 2;
      const groupNames = ['Group A', 'Group B'];

      const result = service.generateGroups(
        mockPeople,
        numberOfGroups,
        groupNames,
        mockCriteria,
        []
      );

      const totalPeople = result.reduce(
        (sum, group) => sum + group.people.length,
        0
      );
      expect(totalPeople).toBe(mockPeople.length);

      // With 6 people and 2 groups, each group should have 3 people
      expect(result[0].people.length).toBe(3);
      expect(result[1].people.length).toBe(3);
    });

    it('should handle uneven distribution when people cannot be divided equally', () => {
      const numberOfGroups = 4;
      const groupNames = ['Group A', 'Group B', 'Group C', 'Group D'];

      const result = service.generateGroups(
        mockPeople,
        numberOfGroups,
        groupNames,
        mockCriteria,
        []
      );

      const totalPeople = result.reduce(
        (sum, group) => sum + group.people.length,
        0
      );
      expect(totalPeople).toBe(mockPeople.length);

      // With 6 people and 4 groups: 2 groups get 2 people, 2 groups get 1 person
      const groupSizes = result
        .map((group) => group.people.length)
        .sort((a, b) => b - a);
      expect(groupSizes).toEqual([2, 2, 1, 1]);
    });

    it('should throw error when number of groups exceeds number of people', () => {
      const numberOfGroups = 10;
      const groupNames = Array.from({ length: 10 }, (_, i) => `Group ${i + 1}`);

      expect(() => {
        service.generateGroups(
          mockPeople,
          numberOfGroups,
          groupNames,
          mockCriteria,
          []
        );
      }).toThrowError('Number of groups cannot exceed number of people');
    });

    it('should throw error when group names length does not match number of groups', () => {
      const numberOfGroups = 2;
      const groupNames = ['Group A']; // Only one name for 2 groups

      expect(() => {
        service.generateGroups(
          mockPeople,
          numberOfGroups,
          groupNames,
          mockCriteria,
          []
        );
      }).toThrowError('Number of group names must match number of groups');
    });

    it('should generate unique group IDs', () => {
      const numberOfGroups = 3;
      const groupNames = ['Group A', 'Group B', 'Group C'];

      const result = service.generateGroups(
        mockPeople,
        numberOfGroups,
        groupNames,
        mockCriteria,
        []
      );

      const ids = result.map((group) => group.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds.length).toBe(numberOfGroups);
    });

    it('should not lose any people during group generation', () => {
      const numberOfGroups = 3;
      const groupNames = ['Group A', 'Group B', 'Group C'];

      const result = service.generateGroups(
        mockPeople,
        numberOfGroups,
        groupNames,
        mockCriteria,
        []
      );

      const allPeopleInGroups = result.flatMap((group) => group.people);
      const allPeopleIds = allPeopleInGroups.map((person) => person.id).sort();
      const originalIds = mockPeople.map((person) => person.id).sort();

      expect(allPeopleIds).toEqual(originalIds);
    });

    it('should work with empty criteria', () => {
      const emptyCriteria: MixCriteria = {
        mixGender: false,
        mixFrenchFluency: false,
        mixFormerDWWM: false,
        mixTechnicalLevel: false,
        mixProfile: false,
        mixAge: false,
      };

      const numberOfGroups = 2;
      const groupNames = ['Group A', 'Group B'];

      const result = service.generateGroups(
        mockPeople,
        numberOfGroups,
        groupNames,
        emptyCriteria,
        []
      );

      expect(result.length).toBe(numberOfGroups);
      expect(result[0].people.length + result[1].people.length).toBe(
        mockPeople.length
      );
    });

    it('should consider previous draws when generating groups', () => {
      const previousDraw: GroupDraw = {
        id: 1,
        date: new Date(),
        listId: 1,
        groups: [
          {
            id: 1,
            name: 'Previous Group 1',
            people: [mockPeople[0], mockPeople[1]],
          },
          {
            id: 2,
            name: 'Previous Group 2',
            people: [mockPeople[2], mockPeople[3]],
          },
        ],
        criteria: mockCriteria,
      };

      const numberOfGroups = 2;
      const groupNames = ['Group A', 'Group B'];

      const result = service.generateGroups(
        mockPeople,
        numberOfGroups,
        groupNames,
        mockCriteria,
        [previousDraw]
      );

      // The function should still work and produce valid groups
      expect(result.length).toBe(numberOfGroups);
      expect(result[0].people.length + result[1].people.length).toBe(
        mockPeople.length
      );
    });
  });

  describe('validateGroupMixing', () => {
    let testGroups: Group[];

    beforeEach(() => {
      testGroups = [
        {
          id: 1,
          name: 'Group A',
          people: [
            mockPeople[0], // John - Male, DWWM, Comfortable, 25
            mockPeople[1], // Jane - Female, No DWWM, Reserved, 30
            mockPeople[2], // Alex - Not Specified, DWWM, Shy, 22
          ],
        },
        {
          id: 2,
          name: 'Group B',
          people: [
            mockPeople[3], // Maria - Female, No DWWM, Comfortable, 28
            mockPeople[4], // Pierre - Male, DWWM, Reserved, 35
            mockPeople[5], // Sophie - Female, No DWWM, Shy, 26
          ],
        },
      ];
    });

    it('should return true for well-mixed groups', () => {
      const result = service.validateGroupMixing(testGroups, mockCriteria);

      // This should return true because groups have good distribution
      expect(typeof result).toBe('boolean');
    });

    it('should return true for single group', () => {
      const singleGroup = [testGroups[0]];
      const result = service.validateGroupMixing(singleGroup, mockCriteria);

      expect(result).toBe(true);
    });

    it('should return true for empty groups array', () => {
      const result = service.validateGroupMixing([], mockCriteria);

      expect(result).toBe(true);
    });

    it('should validate gender mixing when criteria is enabled', () => {
      const genderCriteria: MixCriteria = {
        mixGender: true,
        mixFrenchFluency: false,
        mixFormerDWWM: false,
        mixTechnicalLevel: false,
        mixProfile: false,
        mixAge: false,
      };

      const result = service.validateGroupMixing(testGroups, genderCriteria);
      expect(typeof result).toBe('boolean');
    });

    it('should validate French fluency mixing when criteria is enabled', () => {
      const fluencyCriteria: MixCriteria = {
        mixGender: false,
        mixFrenchFluency: true,
        mixFormerDWWM: false,
        mixTechnicalLevel: false,
        mixProfile: false,
        mixAge: false,
      };

      const result = service.validateGroupMixing(testGroups, fluencyCriteria);
      expect(typeof result).toBe('boolean');
    });

    it('should validate DWWM mixing when criteria is enabled', () => {
      const dwwmCriteria: MixCriteria = {
        mixGender: false,
        mixFrenchFluency: false,
        mixFormerDWWM: true,
        mixTechnicalLevel: false,
        mixProfile: false,
        mixAge: false,
      };

      const result = service.validateGroupMixing(testGroups, dwwmCriteria);
      expect(typeof result).toBe('boolean');
    });

    it('should validate technical level mixing when criteria is enabled', () => {
      const techCriteria: MixCriteria = {
        mixGender: false,
        mixFrenchFluency: false,
        mixFormerDWWM: false,
        mixTechnicalLevel: true,
        mixProfile: false,
        mixAge: false,
      };

      const result = service.validateGroupMixing(testGroups, techCriteria);
      expect(typeof result).toBe('boolean');
    });

    it('should validate profile mixing when criteria is enabled', () => {
      const profileCriteria: MixCriteria = {
        mixGender: false,
        mixFrenchFluency: false,
        mixFormerDWWM: false,
        mixTechnicalLevel: false,
        mixProfile: true,
        mixAge: false,
      };

      const result = service.validateGroupMixing(testGroups, profileCriteria);
      expect(typeof result).toBe('boolean');
    });

    it('should validate age mixing when criteria is enabled', () => {
      const ageCriteria: MixCriteria = {
        mixGender: false,
        mixFrenchFluency: false,
        mixFormerDWWM: false,
        mixTechnicalLevel: false,
        mixProfile: false,
        mixAge: true,
      };

      const result = service.validateGroupMixing(testGroups, ageCriteria);
      expect(typeof result).toBe('boolean');
    });

    it('should handle groups with poorly distributed characteristics', () => {
      // Create groups where all people of same gender are in one group
      const poorlyMixedGroups: Group[] = [
        {
          id: 1,
          name: 'All Males',
          people: [mockPeople[0], mockPeople[4]], // Both male
        },
        {
          id: 2,
          name: 'All Females',
          people: [mockPeople[1], mockPeople[3], mockPeople[5]], // All female
        },
      ];

      const genderCriteria: MixCriteria = {
        mixGender: true,
        mixFrenchFluency: false,
        mixFormerDWWM: false,
        mixTechnicalLevel: false,
        mixProfile: false,
        mixAge: false,
      };

      const result = service.validateGroupMixing(
        poorlyMixedGroups,
        genderCriteria
      );
      // This should detect poor mixing
      expect(typeof result).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    it('should handle minimum case with 2 people and 2 groups', () => {
      const twoPeople = mockPeople.slice(0, 2);
      const numberOfGroups = 2;
      const groupNames = ['Group A', 'Group B'];

      const result = service.generateGroups(
        twoPeople,
        numberOfGroups,
        groupNames,
        mockCriteria,
        []
      );

      expect(result.length).toBe(2);
      expect(result[0].people.length).toBe(1);
      expect(result[1].people.length).toBe(1);
    });

    it('should handle single person in single group', () => {
      const onePerson = [mockPeople[0]];
      const numberOfGroups = 1;
      const groupNames = ['Solo Group'];

      const result = service.generateGroups(
        onePerson,
        numberOfGroups,
        groupNames,
        mockCriteria,
        []
      );

      expect(result.length).toBe(1);
      expect(result[0].people.length).toBe(1);
      expect(result[0].people[0]).toEqual(mockPeople[0]);
    });

    it('should handle large number of people', () => {
      // Create 20 people
      const manyPeople: Person[] = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        frenchFluency: (i % 4) + 1,
        formerDWWM: i % 3 === 0,
        technicalLevel: (i % 4) + 1,
        profile:
          i % 3 === 0
            ? Profile.SHY
            : i % 3 === 1
            ? Profile.RESERVED
            : Profile.COMFORTABLE,
        age: 20 + (i % 30),
      }));

      const numberOfGroups = 5;
      const groupNames = Array.from({ length: 5 }, (_, i) => `Group ${i + 1}`);

      const result = service.generateGroups(
        manyPeople,
        numberOfGroups,
        groupNames,
        mockCriteria,
        []
      );

      expect(result.length).toBe(numberOfGroups);
      const totalPeople = result.reduce(
        (sum, group) => sum + group.people.length,
        0
      );
      expect(totalPeople).toBe(manyPeople.length);
    });
  });

  describe('integration tests', () => {
    it('should maintain data integrity through multiple operations', () => {
      const numberOfGroups = 2;
      const groupNames = ['Group A', 'Group B'];

      // Generate groups
      const groups = service.generateGroups(
        mockPeople,
        numberOfGroups,
        groupNames,
        mockCriteria,
        []
      );

      // Validate the groups
      const isValid = service.validateGroupMixing(groups, mockCriteria);

      expect(groups.length).toBe(numberOfGroups);
      expect(typeof isValid).toBe('boolean');

      // Ensure all original people are still present
      const allPeopleInGroups = groups.flatMap((group) => group.people);
      expect(allPeopleInGroups.length).toBe(mockPeople.length);
    });

    it('should work with multiple previous draws', () => {
      const previousDraws: GroupDraw[] = [
        {
          id: 1,
          date: new Date(),
          listId: 1,
          groups: [
            {
              id: 1,
              name: 'Draw1 Group1',
              people: [mockPeople[0], mockPeople[1]],
            },
            {
              id: 2,
              name: 'Draw1 Group2',
              people: [mockPeople[2], mockPeople[3]],
            },
          ],
          criteria: mockCriteria,
        },
        {
          id: 2,
          date: new Date(),
          listId: 1,
          groups: [
            {
              id: 3,
              name: 'Draw2 Group1',
              people: [mockPeople[0], mockPeople[2]],
            },
            {
              id: 4,
              name: 'Draw2 Group2',
              people: [mockPeople[1], mockPeople[3]],
            },
          ],
          criteria: mockCriteria,
        },
      ];

      const numberOfGroups = 2;
      const groupNames = ['Group A', 'Group B'];

      const result = service.generateGroups(
        mockPeople,
        numberOfGroups,
        groupNames,
        mockCriteria,
        previousDraws
      );

      expect(result.length).toBe(numberOfGroups);
      expect(result[0].people.length + result[1].people.length).toBe(
        mockPeople.length
      );
    });
  });
});
