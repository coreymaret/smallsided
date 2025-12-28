// src/pages/exercises/Exercises.tsx

import { useEffect, useState } from 'react';
import { getAllExercises } from '../../utils/exerciseUtils';
import type { ExerciseMetadata } from '../../types/exercises';
import ExerciseList from '../../components/Exercises/ExerciseList'
import SEO from '../../components/Blog/SEO';
import styles from './Exercises.module.scss';

const Exercises = () => {
  const [exercises, setExercises] = useState<ExerciseMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const allExercises = await getAllExercises();
        setExercises(allExercises);
      } catch (error) {
        console.error('Error loading exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, []);

  if (loading) {
    return (
      <div className={styles['exercises-page-loading']}>
        <div className={styles['exercises-page-spinner']}></div>
        <p>Loading exercises...</p>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Tactical Sessions | Small Sided"
        description="Explore our comprehensive library of tactical training exercises designed to develop intelligent, technical players."
        type="website"
        url="/exercises"
        keywords="soccer training, tactical exercises, youth development, coaching drills"
      />

      <div className={styles['exercises-page']}>
        <header className={styles['exercises-page-header']}>
          <h1 className={styles['exercises-page-title']}>Exercises</h1>
          <p className={styles['exercises-page-description']}>
            Professional training exercises designed to develop intelligent, technical players
          </p>
        </header>

        <ExerciseList exercises={exercises} />
      </div>
    </>
  );
};

export default Exercises;