
import { TrainingProgram, User } from './types';



export const MOCK_USERS: User[] = [
  { id: '1', name: 'Coach Sarah', email: 'sarah@titan.fit', role: 'host', avatar: 'https://picsum.photos/seed/sarah/100' },
  { id: '2', name: 'John Doe', email: 'john@athlete.com', role: 'user', avatar: 'https://picsum.photos/seed/john/100' },

  { id: '3', name: 'Jane Smith', email: 'jane@athlete.com', role: 'user', avatar: 'https://picsum.photos/seed/jane/100' },
];

export const INITIAL_PROGRAMS: TrainingProgram[] = [
  {
    id: 'p1',
    title: 'Hypertrophy Foundations',
    description: 'Master the basics of muscle growth with this 4-week full-body plan.',
    hostId: '1',
    assignedUserIds: ['2'],
    difficulty: 'Beginner',
    durationWeeks: 4,
    workouts: [
      {
        id: 'w1',
        title: 'Push Day A',
        day: 'Monday',
        exercises: [
          { id: 'e1', name: 'Bench Press', sets: 3, reps: '8-10', rest: '90s' },
          { id: 'e2', name: 'Overhead Press', sets: 3, reps: '10', rest: '60s' },
          { id: 'e3', name: 'Tricep Extensions', sets: 3, reps: '15', rest: '45s' },
        ]
      },
      {
        id: 'w2',
        title: 'Pull Day A',
        day: 'Wednesday',
        exercises: [
          { id: 'e4', name: 'Pull Ups', sets: 3, reps: 'AMRAP', rest: '120s' },
          { id: 'e5', name: 'Barbell Rows', sets: 3, reps: '8', rest: '90s' },
          { id: 'e6', name: 'Bicep Curls', sets: 3, reps: '12', rest: '60s' },
        ]
      }
    ]
  }
];
