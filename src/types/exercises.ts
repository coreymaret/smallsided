// src/types/exercise.ts

export interface ExerciseMetadata {
  title: string;
  slug: string;
  description: string;
  ageGroup: string;
  playersRequired: string;
  exerciseTime: string;
  fieldLocation: string;
  phaseOfPlay: string;
  difficulty: string;
  tags: string[];
  featured?: boolean;
}

export interface Exercise extends ExerciseMetadata {
  content: string;
}