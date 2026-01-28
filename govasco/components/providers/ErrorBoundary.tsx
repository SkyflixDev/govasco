'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return <DefaultErrorScreen error={this.state.error} />
    }
    return this.props.children
  }
}

function DefaultErrorScreen({ error }: { error: Error | null }) {
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
          
          <div className="p-8 text-center">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-xl mb-6">
              <span className="text-7xl">X</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-6">
              Vasco encountered an unexpected problem. Try reloading the page.
            </p>

            {process.env.NODE_ENV === 'development' && error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-xs font-mono text-red-700 break-all">
                  {error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleReload}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Reload page
              </button>
              
              <a
                href="/"
                className="block w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Back to home
              </a>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Problem persists? Contact support
            </p>
          </div>

          <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
        </div>
      </div>
    </div>
  )
}