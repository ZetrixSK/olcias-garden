import { Component, type ReactNode } from 'react';

/**
 * If drawing the garden ever fails, show a gentle way back instead of a blank screen. The garden
 * itself is safe in storage; reopening loads it again.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('The garden could not be drawn:', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="oops" role="alert">
        <p>The garden stumbled for a moment.</p>
        <button onClick={() => window.location.reload()}>Open it again</button>
      </div>
    );
  }
}
