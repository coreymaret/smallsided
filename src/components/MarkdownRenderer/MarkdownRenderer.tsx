// src/components/MarkdownRenderer/MarkdownRenderer.tsx

import { lazy, Suspense } from 'react';
import type { Components } from 'react-markdown';
import type { PluggableList } from 'unified';
import './MarkdownRenderer.scss';

const ReactMarkdown = lazy(() => import('react-markdown'));

interface MarkdownRendererProps {
  content: string;
  components?: Components;
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  components,
  remarkPlugins,
  rehypePlugins 
}) => {
  return (
    <Suspense fallback={
      <div className="markdown-loading">
        <div className="markdown-spinner"></div>
        <p>Loading content...</p>
      </div>
    }>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </Suspense>
  );
};

export default MarkdownRenderer;