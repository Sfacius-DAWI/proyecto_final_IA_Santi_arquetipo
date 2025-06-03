import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                ¡Ups! Algo salió mal
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
              </p>
              {this.state.error && (
                <p className="mt-2 text-xs text-gray-500 font-mono">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="mt-8 space-y-3">
              <Button
                onClick={this.handleReset}
                className="w-full"
              >
                Recargar página
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full"
              >
                Volver atrás
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 