import { Link } from 'react-router-dom'
import { ShoppingBasket, Home } from 'lucide-react'
import { PageMeta } from '@/components/PageMeta'

export function NotFoundPage() {
  return (
    <>
      <PageMeta title="Page Not Found" path="/404" />
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-6">
          <ShoppingBasket className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-8 text-center max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </>
  )
}