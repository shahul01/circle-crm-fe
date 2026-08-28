import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold text-muted-foreground/30">404</p>
      <h2 className="mt-2 text-xl font-semibold text-foreground">
        Page not found
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="mt-6">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;
