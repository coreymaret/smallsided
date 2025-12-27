// src/pages/exercises/Exercises.tsx

import { useEffect, useState } from 'react';
import { getAllExercises } from '../../utils/exerciseUtils';
import type { ExerciseMetadata } from '../../types/exercises';
import ExerciseList from '../../components/Exercises/ExerciseList'
import SEO from '../../components/Blog/SEO';
import './Exercises.module.scss';

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

  return (
    <>
      <SEO
        title="Tactical Sessions | Small Sided"
        description="Explore our comprehensive library of tactical training exercises designed to develop intelligent, technical players."
        type="website"
        url="/exercises"
        keywords="soccer training, tactical exercises, youth development, coaching drills"
      />

      <div className="exercises-page">
        <div className="exercises-hero">
          <h1 className="exercises-title">Tactical Sessions</h1>
          <p className="exercises-description">
            Comprehensive training exercises designed to develop intelligent, technical players through structured, age-appropriate sessions.
          </p>
        </div>

        {loading ? (
          <div className="exercises-loading">
            <div className="exercises-spinner"></div>
            <p>Loading exercises...</p>
          </div>
        ) : (
          <ExerciseList exercises={exercises} />
        )}
      </div>
    </>
  );
};

export default Exercises;