// src/components/exercises/ExerciseList.tsx

import { Link } from 'react-router-dom';
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
            <div className="exercise-card-header">
              <h2 className="exercise-card-title">{exercise.title}</h2>
              {exercise.featured && (
                <span className="exercise-card-badge">Featured</span>
              )}
            </div>
            
            <div className="exercise-card-meta">
              <span className="exercise-card-meta-item">
                <strong>Age:</strong> {exercise.ageGroup}
              </span>
              <span className="exercise-card-separator">•</span>
              <span className="exercise-card-meta-item">
                <strong>Players:</strong> {exercise.playersRequired}
              </span>
              <span className="exercise-card-separator">•</span>
              <span className="exercise-card-meta-item">
                <strong>Time:</strong> {exercise.exerciseTime}
              </span>
            </div>

            <p className="exercise-card-description">{exercise.description}</p>

            <div className="exercise-card-details">
              <span className="exercise-card-detail">
                <span className="detail-label">Location:</span> {exercise.fieldLocation}
              </span>
              <span className="exercise-card-detail">
                <span className="detail-label">Phase:</span> {exercise.phaseOfPlay}
              </span>
              <span className="exercise-card-detail">
                <span className="detail-label">Difficulty:</span> {exercise.difficulty}
              </span>
            </div>

            {exercise.tags.length > 0 && (
              <div className="exercise-card-tags">
                {exercise.tags.map((tag) => (
                  <span key={tag} className="exercise-card-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <span className="exercise-card-read-more">
              View exercise →
            </span>
          </Link>
        </article>
      ))}
    </div>
  );
};

export default ExerciseList;