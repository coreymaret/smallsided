import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from '../../components/Icons/Icons';
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
      style={{ borderRadius: '.5rem' }}
    >
      <button
        onClick={onToggle}
        className={styles.accordionButton}
        style={{
          borderRadius: isOpen ? '.5rem .5rem 0 0' : '.5rem'
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
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const accordionData = t('contact.faq.items', { returnObjects: true }) as { title: string; content: string }[];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.accordionContainer}>
      <h2 className={styles.accordionHeading}>{t('contact.faq.heading')}</h2>
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