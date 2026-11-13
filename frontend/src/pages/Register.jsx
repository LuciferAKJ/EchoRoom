import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Lock, Mail, UserCheck } from 'lucide-react';

export const Register = () => {
  return (
    <div className="max-w-md mx-auto py-12">
      <Card className="p-6 md:p-8 space-y-6">
        <CardHeader className="flex-col items-start gap-1">
          <CardTitle className="text-xl font-serif">Create Account</CardTitle>
          <CardDescription>
            Your email is kept strictly private and used solely for account recovery.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input label="Email Address" type="email" placeholder="you@university.edu" icon={Mail} />
          <Input label="Password" type="password" placeholder="••••••••" icon={Lock} />
          <Input label="Confirm Password" type="password" placeholder="••••••••" icon={Lock} />

          <Button className="w-full mt-2" size="lg" icon={UserCheck}>
            Register & Generate Pseudonym
          </Button>

          <p className="text-center text-xs text-echo-subtle pt-2">
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

