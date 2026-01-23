import styles from "./StatRow.module.scss";
import iso1Image from '../../assets/images/home-sections/iso1.webp'

interface StatRowProps {
  id?: string;
  stat: string;
  description: string;
  imageAlt: string;
  reversed?: boolean;
}

const StatRow = ({ id, stat, description, imageAlt, reversed = false }: StatRowProps) => {
  return (
    <section 
      id={id}
      className={`${styles.heroSection} ${reversed ? styles.row2 : ''}`}
    >
      <div className={styles.imageColumn}>
        <img 
          src={iso1Image}
          alt={imageAlt}
          width="400"
          height="400"
          loading="lazy"
        />
      </div>
      <div className={styles.textColumn}>
        <div className={styles.textContent}>
          <h2 className={styles.statHighlight}>{stat}</h2>
          <p className={styles.description}>{description}</p>
          <button className={styles.ctaButton}>Learn More</button>
        </div>
      </div>
    </section>
  );
};

export default StatRow;