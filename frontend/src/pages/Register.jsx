import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Lock, Mail, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password || !confirmPassword) {
      setLocalError('Please fill out all fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(email, password);
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-echo-lavender/15 text-echo-lavender text-xs font-medium mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Anonymous Expression</span>
          </div>
          <CardTitle className="text-xl font-serif">Create Account</CardTitle>
          <CardDescription>
            Your email is kept strictly private for account recovery. We will generate a unique anonymous pseudonym for your posts.
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
              placeholder="At least 6 characters"
              icon={Lock}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              icon={Lock}
              required
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              loading={isSubmitting}
              icon={UserCheck}
            >
              Register & Generate Pseudonym
            </Button>
          </form>

          <p className="text-center text-xs text-echo-subtle pt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-echo-lavender hover:underline font-medium">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
