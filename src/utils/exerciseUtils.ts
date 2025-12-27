// src/utils/exerciseUtils.ts

import type { Exercise, ExerciseMetadata } from '../types/exercises';

// Import all markdown files from src/content/exercises
const exerciseModules = import.meta.glob('/src/content/exercises/*.md', { 
  eager: true,
  as: 'raw'
});

console.log('Exercise modules found:', Object.keys(exerciseModules));
console.log('Total exercise files:', Object.keys(exerciseModules).length);

export const getAllExercises = async (): Promise<ExerciseMetadata[]> => {
  try {
    console.log('getAllExercises called');
    const exercises: ExerciseMetadata[] = [];

    for (const path in exerciseModules) {
      console.log('Processing exercise file:', path);
      const content = exerciseModules[path] as string;
      console.log('Content preview:', content.substring(0, 200));
      const metadata = parseExerciseMetadata(content);
      console.log('Parsed metadata:', metadata);
      if (metadata) {
        exercises.push(metadata);
      }
    }

    console.log('Total exercises loaded:', exercises.length);
    return exercises.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.title.localeCompare(b.title);
    });
  } catch (error) {
    console.error('Error loading exercises:', error);
    return [];
  }
};

export const getExerciseBySlug = async (slug: string): Promise<Exercise | null> => {
  try {
    // Find the matching file
    const matchingPath = Object.keys(exerciseModules).find(path => 
      path.includes(`/${slug}.md`)
    );

    if (!matchingPath) {
      console.error(`Exercise not found: ${slug}`);
      return null;
    }

    const content = exerciseModules[matchingPath] as string;
    const metadata = parseExerciseMetadata(content);
    
    if (!metadata) {
      console.error('Could not parse metadata for:', slug);
      return null;
    }

    const exerciseContent = content.replace(/^---[\s\S]*?---\n/, '');

    return {
      ...metadata,
      content: exerciseContent
    };
  } catch (error) {
    console.error(`Error loading exercise ${slug}:`, error);
    return null;
  }
};

const parseExerciseMetadata = (content: string): ExerciseMetadata | null => {
  // Handle both \n and \r\n line endings
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    console.error('No frontmatter found in content');
    console.log('First 300 chars:', content.substring(0, 300));
    return null;
  }

  const frontmatter = match[1];
  const lines = frontmatter.split(/\r?\n/); // Split on both types of line endings
  const metadata: any = {};

  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();
    
    // Remove quotes
    value = value.replace(/^["']|["']$/g, '');
    
    if (key === 'tags') {
      // Handle array format: ["tag1", "tag2"]
      value = value.replace(/^\[|\]$/g, '');
      metadata[key] = value.split(',').map(tag => tag.trim().replace(/^["']|["']$/g, ''));
    } else if (key === 'featured') {
      metadata[key] = value === 'true';
    } else {
      metadata[key] = value;
    }
  });

  // Validate required fields
  if (!metadata.title || !metadata.slug) {
    console.error('Missing required fields in frontmatter:', metadata);
    return null;
  }

  console.log('Successfully parsed metadata:', metadata);
  return metadata as ExerciseMetadata;
};