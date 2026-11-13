import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="py-20 text-center space-y-4 max-w-md mx-auto">
      <h1 className="text-4xl font-serif font-bold text-echo-lavender">404</h1>
      <h2 className="text-lg font-semibold text-echo-text">Thought Lost in the Echoes</h2>
      <p className="text-xs text-echo-muted">
        The page or thought you were looking for doesn't exist or has expired.
      </p>
      <div className="pt-2">
        <Link to="/feed">
          <Button icon={ArrowLeft} size="sm">
            Return to Feed
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
