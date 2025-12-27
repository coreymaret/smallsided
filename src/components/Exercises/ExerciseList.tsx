// src/components/exercises/ExerciseList.tsx

import { Link } from 'react-router-dom';
import { Users, UserPlus, Clock, MapPin, Gauge, RefreshCcw } from 'lucide-react';
import type { ExerciseMetadata } from '../../types/exercises'
import './ExerciseList.scss';

interface ExerciseListProps {
  exercises: ExerciseMetadata[];
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises }) => {
  if (exercises.length === 0) {
    return (
      <div className="exercise-list-empty">
        <p>No exercises yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="exercise-list">
      {exercises.map((exercise) => (
        <article key={exercise.slug} className="exercise-card">
          <Link to={`/exercises/${exercise.slug}`} className="exercise-card-link">
            <div className="exercise-card-image">
              {/* Placeholder image - replace with actual image later */}
            </div>

            <div className="exercise-card-content">
              <div className="exercise-card-header">
                <h2 className="exercise-card-title">{exercise.title}</h2>
                {exercise.featured && (
                  <span className="exercise-card-badge">Featured</span>
                )}
              </div>

              <p className="exercise-card-description">{exercise.description}</p>

              <div className="exercise-card-meta-grid">
                <div className="meta-grid-item">
                  <Users size={16} className="meta-icon" />
                  <span>{exercise.ageGroup}</span>
                </div>
                <div className="meta-grid-item">
                  <UserPlus size={16} className="meta-icon" />
                  <span>{exercise.playersRequired}</span>
                </div>
                <div className="meta-grid-item">
                  <Clock size={16} className="meta-icon" />
                  <span>{exercise.exerciseTime}</span>
                </div>
                <div className="meta-grid-item">
                  <MapPin size={16} className="meta-icon" />
                  <span>{exercise.fieldLocation}</span>
                </div>
                <div className="meta-grid-item">
                  <Gauge size={16} className="meta-icon" />
                  <span>{exercise.difficulty}</span>
                </div>
                <div className="meta-grid-item">
                  <RefreshCcw size={16} className="meta-icon" />
                  <span>{exercise.phaseOfPlay}</span>
                </div>
              </div>

              <span className="exercise-card-read-more">
                View exercise →
              </span>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
};

export default ExerciseList;