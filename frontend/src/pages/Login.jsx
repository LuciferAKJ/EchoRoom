import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Lock, Mail, LogIn } from 'lucide-react';

export const Login = () => {
  return (
    <div className="max-w-md mx-auto py-12">
      <Card className="p-6 md:p-8 space-y-6">
        <CardHeader className="flex-col items-start gap-1">
          <CardTitle className="text-xl font-serif">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access your anonymous identities and saved thoughts.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input label="Email Address" type="email" placeholder="you@university.edu" icon={Mail} />
          <Input label="Password" type="password" placeholder="••••••••" icon={Lock} />

          <Button className="w-full mt-2" size="lg" icon={LogIn}>
            Log In
          </Button>

          <p className="text-center text-xs text-echo-subtle pt-2">
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

