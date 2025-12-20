import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './ContactAccordion.module.scss';

interface AccordionItemProps {
  title: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem = ({ title, content, isOpen, onToggle }: AccordionItemProps) => {
  return (
    <div 
      className={`${styles.accordionItem} ${isOpen ? styles.open : ''}`}
      style={{ borderRadius: '1rem' }}
    >
      <button
        onClick={onToggle}
        className={styles.accordionButton}
        style={{
          borderRadius: isOpen ? '1rem 1rem 0 0' : '1rem'
        }}
      >
        <span className={styles.accordionTitle}>{title}</span>
        <ChevronDown className={`${styles.chevron} ${isOpen ? styles.rotate : ''}`} />
      </button>
      <div className={`${styles.accordionContent} ${isOpen ? styles.expanded : ''}`}>
        <div className={styles.accordionContentInner} style={{ borderRadius: '0 0 1rem 1rem' }}>
          <p>{content}</p>
        </div>
      </div>
    </div>
  );
};

export default function Accordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const accordionData = [
    {
      title: 'What are your operating hours?',
      content: 'We are open Monday through Friday from 9 AM to 6 PM EST. Weekend hours vary by season, so please contact us for current availability.',
    },
    {
      title: 'Do you offer group training sessions?',
      content: 'Yes! We offer group training sessions for teams and individuals. Group sessions can be customized based on skill level and training goals.',
    },
    {
      title: 'What age groups do you work with?',
      content: 'We work with players of all ages, from youth leagues (ages 6+) to adult recreational and competitive players. Our training programs are tailored to each age group.',
    },
    {
      title: 'How do I schedule a training session?',
      content: 'You can schedule a session by filling out the contact form above, calling us directly, or sending us an email. We\'ll respond within 24 hours to confirm availability.',
    },
    {
      title: 'What should I bring to training?',
      content: 'Please bring comfortable athletic clothing, soccer cleats or turf shoes, shin guards, a water bottle, and a soccer ball. We provide all other necessary training equipment.',
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.accordionContainer}>
      <h2 className={styles.accordionHeading}>Frequently Asked Questions</h2>
      <div className={styles.accordionWrapper}>
        {accordionData.map((item, index) => (
          <AccordionItem
            key={index}
            title={item.title}
            content={item.content}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </div>
  );
}