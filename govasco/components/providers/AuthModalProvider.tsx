'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { RequireAuthModal } from '@/components/layout/RequireAuthModal'

interface AuthModalContextType {
  showAuthModal: (options?: AuthModalOptions) => void
  hideAuthModal: () => void
}

interface AuthModalOptions {
  message?: string
  redirectAfterLogin?: string
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<AuthModalOptions>({})

  const showAuthModal = (opts?: AuthModalOptions) => {
    setOptions(opts || {})
    setIsOpen(true)
  }

  const hideAuthModal = () => {
    setIsOpen(false)
    setOptions({})
  }

  return (
    <AuthModalContext.Provider value={{ showAuthModal, hideAuthModal }}>
      {children}
      <RequireAuthModal
        isOpen={isOpen}
        onClose={hideAuthModal}
        message={options.message}
        redirectAfterLogin={options.redirectAfterLogin}
      />
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider')
  }
  return context
}