// src/components/ErrorBoundary/ErrorBoundary.tsx
import { Component, type ReactNode, type ErrorInfo } from 'react';
import styles from './ErrorBoundary.module.scss';

interface Props {
  children: ReactNode;
  admin?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ─── Public fallback UI ───────────────────────────────────────────────────────

class PublicErrorFallback extends Component<{ error: Error | null; onReset: () => void; onReload: () => void }> {
  animationContainer = { current: null as HTMLDivElement | null };
  animationInstance: any = null;

  componentDidMount() {
    this.loadAnimation();
  }

  componentWillUnmount() {
    if (this.animationInstance) this.animationInstance.destroy();
  }

  loadAnimation = async () => {
    if (!this.animationContainer.current) return;
    try {
      const lottieModule = await import('lottie-web');
      const lottie = lottieModule.default;
      const response = await fetch('/NotFound.json');
      if (!response.ok) return;
      const animationData = await response.json();
      if (this.animationInstance) this.animationInstance.destroy();
      this.animationInstance = lottie.loadAnimation({
        container: this.animationContainer.current,
        renderer: 'svg', loop: true, autoplay: true, animationData,
      });
    } catch (err) {
      console.error('Failed to load animation:', err);
    }
  };

  render() {
    return (
      <div className={styles.notFoundContainer}>
        <div className={styles.content}>
          <div
            className={styles.animationWrapper}
            ref={el => { this.animationContainer.current = el; }}
          />
          <h1 className={styles.heading}>Oops!</h1>
          <h2 className={styles.subheading}>Something went wrong</h2>
          {import.meta.env.DEV && this.props.error && (
            <pre className={styles.errorStack}>{this.props.error.message}</pre>
          )}
          <div className={styles.buttonRow}>
            <button className={styles.goBackButton} onClick={this.props.onReload}>Try Again</button>
            <button className={styles.goBackButton} onClick={this.props.onReset}>Go Home</button>
          </div>
        </div>
      </div>
    );
  }
}

// ─── Admin fallback UI ────────────────────────────────────────────────────────

const AdminErrorFallback = ({ error, onReset }: { error: Error | null; onReset: () => void }) => (
  <div className={styles.adminError}>
    <div className={styles.content}>
      <h1 className={styles.heading}>Oops!</h1>
      <h2 className={styles.subheading}>Something went wrong in the dashboard</h2>
      {import.meta.env.DEV && error && (
        <pre className={styles.errorStack}>{error.message}</pre>
      )}
      <div className={styles.buttonRow}>
        <button className={styles.goBackButton} onClick={onReset}>Back to Dashboard</button>
      </div>
    </div>
  </div>
);

// ─── Error Boundary ───────────────────────────────────────────────────────────

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = this.props.admin ? '/admin' : '/';
  };

  handleReload = () => window.location.reload();

  render() {
    if (this.state.hasError) {
      if (this.props.admin) {
        return <AdminErrorFallback error={this.state.error} onReset={this.handleReset} />;
      }
      return <PublicErrorFallback error={this.state.error} onReset={this.handleReset} onReload={this.handleReload} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
