import styles from "./Home.module.scss";
import Popup from '../../components/Popup/Popup'
import SEO from '../../components/Blog/SEO';
import { getSEOConfig } from '../../config/seo';
import { useEffect, useRef, useState } from 'react';
import { Trophy, Target, Users, Lightbulb, TrendingUp, Award, ArrowDownRight } from 'lucide-react';
import ReviewSection from '../../components/Reviews/ReviewSection';
import PricingSection from '../../components/PricingSection/PricingSection';

// TODO: Update these image import paths to match your actual image locations
import iso1Image from '../../assets/images/home-sections/iso1.png';

const Home = () => {
  const seo = getSEOConfig('home');
  
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector('#row1');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Animated counter hook
  const useCountUp = (end: number, duration: number = 2000, isVisible: boolean) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (!isVisible) return;
      
      let startTime: number | null = null;
      const startValue = 0;
      
      const animate = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        // Ease-in-out function
        const easeInOutQuad = (t: number) => 
          t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        
        const currentCount = Math.floor(easeInOutQuad(progress) * (end - startValue) + startValue);
        setCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, [end, duration, isVisible]);
    
    return count;
  };

  // Intersection Observer for triggering animation
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [isVisible]);

  const stat1 = useCountUp(10000, 2000, isVisible);
  const stat2 = useCountUp(850, 2000, isVisible);
  const stat3 = useCountUp(47, 2000, isVisible);
  const stat4 = useCountUp(98, 2000, isVisible);

  return (
    <>
    <SEO {...seo} />
    <div className={styles.homePage}>
      {/* Intro Hero Section */}
      <section className={styles.introHero}>
        <div className={styles.imageColumn}>
          <img 
            src={iso1Image}
            alt="Small-sided soccer isometric illustration"
            width="400"
            height="400"
            loading="eager"
          />
        </div>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <h1 className={styles.heroTitle}>The Future of Youth Soccer is Small-Sided</h1>
            <p className={styles.heroSubtitle}>More touches. More decisions. More development. Discover why the world's best academies are choosing small-sided formats to develop tomorrow's stars.</p>
            <a href="#row1" className={styles.ctaButton} onClick={scrollToSection}>Learn More</a>
          </div>
        </div>
      </section>

      {/* Animated Statistics Section */}
      <section ref={statsRef} className={styles.statsSection}>
        <div className={styles.statColumn}>
          <div className={styles.statNumber}>{stat1.toLocaleString()}+</div>
          <div className={styles.statLabel}>Youth Players Trained</div>
        </div>
        <div className={styles.statColumn}>
          <div className={styles.statNumber}>{stat2.toLocaleString()}+</div>
          <div className={styles.statLabel}>Training Sessions</div>
        </div>
        <div className={styles.statColumn}>
          <div className={styles.statNumber}>{stat3}+</div>
          <div className={styles.statLabel}>Partner Academies</div>
        </div>
        <div className={styles.statColumn}>
          <div className={styles.statNumber}>{stat4}%</div>
          <div className={styles.statLabel}>Player Satisfaction</div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresSectionHeader}>
          <h2 className={styles.featuresSectionTitle}>Why Small-Sided Soccer Works</h2>
          <p className={styles.featuresSectionSubtitle}>Discover the key benefits that make small-sided formats the superior choice for youth development</p>
        </div>

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

        <div className={styles.featuresSectionFooter}>
          <a href="#" className={styles.ctaButton}>Learn More</a>
        </div>
      </section>
<PricingSection />
      {/* Row 1 */}
      <section id="row1" className={styles.heroSection}>
        <div className={styles.imageColumn}>
          <img 
            src={iso1Image}
            alt="Youth soccer player dribbling a ball in 7v7 format"
            width="400"
            height="400"
            loading="eager"
          />
        </div>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <h2 className={styles.statHighlight}>50% MORE TOUCHES IN 7V7</h2>
            <p className={styles.description}>Half your team, double the development. Players get 50% more ball touches in 7v7 vs 11v11. Every touch matters when you're building tomorrow's stars.</p>
            <button className={styles.ctaButton}>Learn More</button>
          </div>
        </div>
      </section>

      {/* Row 2 - REVERSED ORDER */}
      <section className={`${styles.heroSection} ${styles.row2}`}>
        <div className={styles.imageColumn}>
          <img 
            src={iso1Image}
            alt="Youth soccer player running with the ball"
            width="400"
            height="400"
            loading="lazy"
          />
        </div>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <h2 className={styles.statHighlight}>66% LESS STANDING AROUND</h2>
            <p className={styles.description}>The ball is out of play 34% of the time in 11v11, but only 8% in 4v4. That means 66% less time standing around and 66% more time developing skills.</p>
            <button className={styles.ctaButton}>Learn More</button>
          </div>
        </div>
      </section>
      {/* Row 3 */}
      <section className={styles.heroSection}>
        <div className={styles.imageColumn}>
          <img 
            src={iso1Image}
            alt="Youth soccer player shooting at goal"
            width="400"
            height="400"
            loading="lazy"
          />
        </div>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <h2 className={styles.statHighlight}>2X MORE SCORING OPPORTUNITIES</h2>
            <p className={styles.description}>Goals every 2 minutes in 4v4 vs. every 4 minutes in 7v7. Double the chances to practice finishing, double the confidence, double the joy. This is how you fall in love with the game.</p>
            <button className={styles.ctaButton}>Learn More</button>
          </div>
        </div>
      </section>

      {/* Row 4 - REVERSED ORDER */}
      <section className={`${styles.heroSection} ${styles.row2}`}>
        <div className={styles.imageColumn}>
          <img 
            src={iso1Image}
            alt="Youth soccer player in one-on-one battle with defender"
            width="400"
            height="400"
            loading="lazy"
          />
        </div>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <h2 className={styles.statHighlight}>3X MORE 1V1 BATTLES</h2>
            <p className={styles.description}>Want your player to develop confidence? Small-sided games create 3X more one-on-one situations in 4v4 (and 2X more in 7v7). Real game scenarios, real skill development.</p>
            <button className={styles.ctaButton}>Learn More</button>
          </div>
        </div>
      </section>
      <ReviewSection />
      <Popup />
    </div>
    </>
  );
};

export default Home;