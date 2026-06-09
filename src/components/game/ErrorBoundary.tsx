"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Generic fallback boundary — the game is offline, so any error is unexpected. */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
          <p className="text-lg font-medium text-white">Algo deu errado. Recarregue a página.</p>
          <Button
            size="lg"
            onClick={this.handleReload}
            className="bg-party-amber hover:bg-party-amber/90 min-h-14 rounded-xl font-semibold text-purple-950"
          >
            Recarregar
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
