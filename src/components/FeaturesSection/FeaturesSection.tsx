import styles from "./FeaturesSection.module.scss";
import { Trophy, Target, Users, Lightbulb, TrendingUp, Award, ArrowDownRight } from '../../components/Icons/Icons';

const FeaturesSection = () => {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresContainer}>
        <div className={styles.featureItem}>
          <div className={styles.featureIconWrapper}>
            <Trophy className={styles.featureIcon} size={32} />
          </div>
          <h3 className={styles.featureHeading}>Championship Development</h3>
          <p className={styles.featureSubheading}>Build winning mentalities through structured small-sided play</p>
          <ul className={styles.featureList}>
            <li><ArrowDownRight size={16} /> Enhanced competitive spirit</li>
            <li><ArrowDownRight size={16} /> Victory through teamwork</li>
            <li><ArrowDownRight size={16} /> Mental toughness training</li>
          </ul>
        </div>

        <div className={styles.featureItem}>
          <div className={styles.featureIconWrapper}>
            <Target className={styles.featureIcon} size={32} />
          </div>
          <h3 className={styles.featureHeading}>Precision Training</h3>
          <p className={styles.featureSubheading}>Focus on technical skills with targeted small-group sessions</p>
          <ul className={styles.featureList}>
            <li><ArrowDownRight size={16} /> Individual attention guaranteed</li>
            <li><ArrowDownRight size={16} /> Skill-specific drills</li>
            <li><ArrowDownRight size={16} /> Measurable progress tracking</li>
          </ul>
        </div>

        <div className={styles.featureItem}>
          <div className={styles.featureIconWrapper}>
            <Users className={styles.featureIcon} size={32} />
          </div>
          <h3 className={styles.featureHeading}>Team Chemistry</h3>
          <p className={styles.featureSubheading}>Foster deeper connections through intimate team dynamics</p>
          <ul className={styles.featureList}>
            <li><ArrowDownRight size={16} /> Stronger communication bonds</li>
            <li><ArrowDownRight size={16} /> Enhanced field awareness</li>
            <li><ArrowDownRight size={16} /> Leadership opportunities</li>
          </ul>
        </div>

        <div className={styles.featureItem}>
          <div className={styles.featureIconWrapper}>
            <Lightbulb className={styles.featureIcon} size={32} />
          </div>
          <h3 className={styles.featureHeading}>Tactical Intelligence</h3>
          <p className={styles.featureSubheading}>Develop soccer IQ through increased decision-making moments</p>
          <ul className={styles.featureList}>
            <li><ArrowDownRight size={16} /> Quick thinking under pressure</li>
            <li><ArrowDownRight size={16} /> Strategic positioning skills</li>
            <li><ArrowDownRight size={16} /> Game reading abilities</li>
          </ul>
        </div>

        <div className={styles.featureItem}>
          <div className={styles.featureIconWrapper}>
            <TrendingUp className={styles.featureIcon} size={32} />
          </div>
          <h3 className={styles.featureHeading}>Accelerated Growth</h3>
          <p className={styles.featureSubheading}>Experience faster skill progression in small-sided formats</p>
          <ul className={styles.featureList}>
            <li><ArrowDownRight size={16} /> Rapid technical improvement</li>
            <li><ArrowDownRight size={16} /> Confidence building through reps</li>
            <li><ArrowDownRight size={16} /> Consistent performance gains</li>
          </ul>
        </div>

        <div className={styles.featureItem}>
          <div className={styles.featureIconWrapper}>
            <Award className={styles.featureIcon} size={32} />
          </div>
          <h3 className={styles.featureHeading}>Elite Preparation</h3>
          <p className={styles.featureSubheading}>Train like the pros with academy-level methodologies</p>
          <ul className={styles.featureList}>
            <li><ArrowDownRight size={16} /> Professional training standards</li>
            <li><ArrowDownRight size={16} /> College recruitment ready</li>
            <li><ArrowDownRight size={16} /> Advanced tactical concepts</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;