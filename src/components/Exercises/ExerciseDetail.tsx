// src/components/exercises/ExerciseDetail.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { 
  Twitter, Linkedin, Facebook, Link as LinkIcon, Check,
  Users, UserPlus, Clock, MapPin, RefreshCcw, Gauge,
  Target, Settings, HelpCircle, TrendingUp, ChevronDown,
  Ruler, Wrench, Shirt, Rows3
} from 'lucide-react';
import { getExerciseBySlug } from '../../utils/exerciseUtils';
import type { Exercise } from '../../types/exercises';
import SEO from '../Blog/SEO';
import './ExerciseDetail.scss';

const ExerciseDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const loadExercise = async () => {
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const exerciseData = await getExerciseBySlug(slug);
        if (exerciseData) {
          setExercise(exerciseData);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error loading exercise:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadExercise();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const trackLength = documentHeight - windowHeight;
      const progress = (scrollTop / trackLength) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shareUrl = window.location.href;
  const shareTitle = exercise?.title || '';

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const extractSection = (content: string, sectionTitle: string): string => {
    const regex = new RegExp(`## ${sectionTitle}\\s*([\\s\\S]*?)(?=## |$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  };

  if (loading) {
    return (
      <div className="exercise-loading">
        <div className="exercise-spinner"></div>
        <p>Loading exercise...</p>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="exercise-error">
        <h1>Exercise Not Found</h1>
        <p>The exercise you're looking for doesn't exist.</p>
        <Link to="/exercises" className="exercise-back-link">
          ← Back to Exercises
        </Link>
      </div>
    );
  }

  // Extract only the content before the first ## heading (intro paragraphs)
  // Also strip any remaining frontmatter just in case
  const contentAfterFrontmatter = exercise.content.replace(/^---[\s\S]*?---\n*/m, '');
  const introContent = contentAfterFrontmatter.split(/^## /m)[0].trim();

  return (
    <>
      <SEO
        title={`${exercise.title} | Tactical Exercise`}
        description={exercise.description}
        type="article"
        url={`/exercises/${exercise.slug}`}
        keywords={exercise.tags.join(', ')}
        tags={exercise.tags}
      />

      <div className="reading-progress-bar">
        <div
          className="reading-progress-fill"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      <article className="exercise-detail">
        <div className="floating-share">
          <button 
            className="share-button share-twitter"
            onClick={() => handleShare('twitter')}
            aria-label="Share on Twitter"
          >
            <Twitter size={20} />
          </button>
          <button 
            className="share-button share-linkedin"
            onClick={() => handleShare('linkedin')}
            aria-label="Share on LinkedIn"
          >
            <Linkedin size={20} />
          </button>
          <button 
            className="share-button share-facebook"
            onClick={() => handleShare('facebook')}
            aria-label="Share on Facebook"
          >
            <Facebook size={20} />
          </button>
          <button 
            className="share-button share-link"
            onClick={handleCopyLink}
            aria-label="Copy link"
          >
            {copied ? <Check size={20} /> : <LinkIcon size={20} />}
          </button>
        </div>

        <div className="container">
          <div 
            className="exercise-hero-image"
            style={{
              backgroundImage: exercise.heroImage 
                ? `url(${exercise.heroImage})`
                : 'linear-gradient(135deg, #98ED66 0%, #15141a 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Placeholder gradient shown when no heroImage is provided */}
          </div>
          
          <header className="exercise-header">
            <h1 className="exercise-title">{exercise.title}</h1>
            <p className="exercise-description">{exercise.description}</p>
          </header>

          {/* Meta Information */}
          <div className="exercise-meta-container">
            <div className="meta-items">
              <div className="meta-item">
                <div className="meta-icon">
                  <Users size={20} />
                </div>
                <div className="meta-content">
                  <span className="meta-label">Age Group</span>
                  <span className="meta-value">{exercise.ageGroup}</span>
                </div>
              </div>

              <div className="meta-item">
                <div className="meta-icon">
                  <UserPlus size={20} />
                </div>
                <div className="meta-content">
                  <span className="meta-label">Players</span>
                  <span className="meta-value">{exercise.playersRequired}</span>
                </div>
              </div>

              <div className="meta-item">
                <div className="meta-icon">
                  <Clock size={20} />
                </div>
                <div className="meta-content">
                  <span className="meta-label">Duration</span>
                  <span className="meta-value">{exercise.exerciseTime}</span>
                </div>
              </div>

              <div className="meta-item">
                <div className="meta-icon">
                  <MapPin size={20} />
                </div>
                <div className="meta-content">
                  <span className="meta-label">Field Location</span>
                  <span className="meta-value">{exercise.fieldLocation}</span>
                </div>
              </div>

              <div className="meta-item">
                <div className="meta-icon">
                  <RefreshCcw size={20} />
                </div>
                <div className="meta-content">
                  <span className="meta-label">Phase of Play</span>
                  <span className="meta-value">{exercise.phaseOfPlay}</span>
                </div>
              </div>

              <div className="meta-item">
                <div className="meta-icon">
                  <Gauge size={20} />
                </div>
                <div className="meta-content">
                  <span className="meta-label">Difficulty</span>
                  <span className="meta-value">{exercise.difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Accordion */}
          <div className="accordionContainer">
            <h2 className="accordionHeading">Exercise Details</h2>
            
            <div className="accordionWrapper">
              {/* Objective */}
              <div className={`accordionItem ${openAccordion === 'objective' ? 'open' : ''}`}>
                <button className="accordionButton" onClick={() => toggleAccordion('objective')}>
                  <div className="accordionTitleWrapper">
                    <Target size={20} />
                    <span className="accordionTitle">Objective</span>
                  </div>
                  <ChevronDown size={20} className={`chevron ${openAccordion === 'objective' ? 'rotate' : ''}`} />
                </button>
                <div className={`accordionContent ${openAccordion === 'objective' ? 'expanded' : ''}`}>
                  <div className="accordionContentInner">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {extractSection(exercise.content, 'Objective')}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Setup */}
              <div className={`accordionItem ${openAccordion === 'setup' ? 'open' : ''}`}>
                <button className="accordionButton" onClick={() => toggleAccordion('setup')}>
                  <div className="accordionTitleWrapper">
                    <Settings size={20} />
                    <span className="accordionTitle">Setup</span>
                  </div>
                  <ChevronDown size={20} className={`chevron ${openAccordion === 'setup' ? 'rotate' : ''}`} />
                </button>
                <div className={`accordionContent ${openAccordion === 'setup' ? 'expanded' : ''}`}>
                  <div className="accordionContentInner">
                    {(() => {
                      const content = extractSection(exercise.content, 'Setup');
                      const sections = [
                        { key: 'Field Dimensions', icon: <Ruler size={20} /> },
                        { key: 'Equipment', icon: <Wrench size={20} /> },
                        { key: 'Player Positions', icon: <Shirt size={20} /> },
                        { key: 'Zones', icon: <Rows3 size={20} /> }
                      ];
                      
                      return sections.map((section, idx) => {
                        const regex = new RegExp(`\\*\\*${section.key}[:\\s*]*\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*(?:Field Dimensions|Equipment|Player Positions|Zones)|$)`, 'i');
                        const match = content.match(regex);
                        
                        if (match) {
                          const sectionContent = `**${section.key}:** ${match[1]}`;
                          return (
                            <div key={idx} className="setup-item">
                              <span className="setup-icon">{section.icon}</span>
                              <div className="setup-content">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                  {sectionContent.trim()}
                                </ReactMarkdown>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Coaching Points */}
              <div className={`accordionItem ${openAccordion === 'coaching' ? 'open' : ''}`}>
                <button className="accordionButton" onClick={() => toggleAccordion('coaching')}>
                  <div className="accordionTitleWrapper">
                    <HelpCircle size={20} />
                    <span className="accordionTitle">Coaching Points</span>
                  </div>
                  <ChevronDown size={20} className={`chevron ${openAccordion === 'coaching' ? 'rotate' : ''}`} />
                </button>
                <div className={`accordionContent ${openAccordion === 'coaching' ? 'expanded' : ''}`}>
                  <div className="accordionContentInner">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {extractSection(exercise.content, 'Coaching Points')}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Progressions */}
              <div className={`accordionItem ${openAccordion === 'progressions' ? 'open' : ''}`}>
                <button className="accordionButton" onClick={() => toggleAccordion('progressions')}>
                  <div className="accordionTitleWrapper">
                    <TrendingUp size={20} />
                    <span className="accordionTitle">Progressions</span>
                  </div>
                  <ChevronDown size={20} className={`chevron ${openAccordion === 'progressions' ? 'rotate' : ''}`} />
                </button>
                <div className={`accordionContent ${openAccordion === 'progressions' ? 'expanded' : ''}`}>
                  <div className="accordionContentInner">
                    <ol className="progressions-list">
                      {(() => {
                        const content = extractSection(exercise.content, 'Progressions');
                        // Split by **1., **2., etc.
                        const items = content.split(/\*\*\d+\.\s+/).filter(s => s.trim());
                        
                        return items.map((item, idx) => {
                          // Remove the title from the content since it's already in the split
                          const cleanItem = item.replace(/\*\*\s*\n/, '').trim();
                          return (
                            <li key={idx}>
                              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                {cleanItem}
                              </ReactMarkdown>
                            </li>
                          );
                        });
                      })()}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content (Article) */}
          <div className="content-section">
            <h2 className="section-title">About {exercise.title}</h2>
            <div className="section-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {introContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Share Section - OUTSIDE container */}
        <div className="share-section">
          <h3 className="share-title">Share this exercise</h3>
          <div className="share-buttons">
            <button className="share-button-large" onClick={() => handleShare('twitter')}>
              <Twitter size={18} /> Twitter
            </button>
            <button className="share-button-large" onClick={() => handleShare('linkedin')}>
              <Linkedin size={18} /> LinkedIn
            </button>
            <button className="share-button-large" onClick={() => handleShare('facebook')}>
              <Facebook size={18} /> Facebook
            </button>
            <button className="share-button-large" onClick={handleCopyLink}>
              {copied ? <Check size={18} /> : <LinkIcon size={18} />} {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Back to Exercises */}
        <div className="exercise-footer">
          <Link to="/exercises" className="back-link">
            ← Back to all exercises
          </Link>
        </div>
      </article>
    </>
  );
};

export default ExerciseDetail;