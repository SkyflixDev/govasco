import { AuthCallback } from '@/components/auth/AuthCallback'

/**
 * Auth Callback Page
 * 
 * This page is shown after successful authentication
 * It handles merging draft trips to database and redirects
 */
export default function AuthCallbackPage() {
  return <AuthCallback />
}