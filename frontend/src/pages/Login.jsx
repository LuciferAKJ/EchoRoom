import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Lock, Mail, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/feed');
    } else {
      setLocalError(result.error);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12">
      <Card className="p-6 sm:p-8 space-y-6">
        <CardHeader className="flex-col items-start gap-1">
          <CardTitle className="text-xl font-serif">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access your anonymous persona, saved bookmarks, and ongoing discussions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {localError && (
            <div className="mb-4 p-3 rounded-lg bg-echo-rose/15 border border-echo-rose/30 flex items-start gap-2.5 text-xs text-echo-rose">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              icon={Mail}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              required
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              loading={isSubmitting}
              icon={LogIn}
            >
              Log In
            </Button>
          </form>

          <p className="text-center text-xs text-echo-subtle pt-4">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-echo-lavender hover:underline font-medium">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
