/**
 * Split Screen Login Page for Delegate AI
 * =======================================
 * 
 * Features:
 * - Split screen layout with authentication on left, community announcements on right
 * - Title "DELEGATE AI" moved to left side above demo mode section
 * - Community announcements controlled by admin console
 * - Responsive design that stacks on mobile
 * - Enhanced brand-focused title design with blue DELEGATE emphasis
 * - All original functionality preserved
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useApp } from './AppContext';
import { CommunityAnnouncements } from './CommunityAnnouncements';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Play,
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

interface FormData {
  email: string;
  password: string;
  displayName: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  displayName?: string;
  confirmPassword?: string;
  general?: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
  label: string;
}

/**
 * Password strength calculator
 */
const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, feedback: [], color: 'bg-gray-200', label: 'Enter password' };
  }

  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) {
    score += 25;
  } else {
    feedback.push('Use at least 8 characters');
  }

  if (/[A-Z]/.test(password)) {
    score += 25;
  } else {
    feedback.push('Include uppercase letters');
  }

  if (/[a-z]/.test(password)) {
    score += 25;
  } else {
    feedback.push('Include lowercase letters');
  }

  if (/[\d\W]/.test(password)) {
    score += 25;
  } else {
    feedback.push('Include numbers or symbols');
  }

  let color = 'bg-red-400';
  let label = 'Weak';

  if (score >= 75) {
    color = 'bg-emerald-500';
    label = 'Strong';
  } else if (score >= 50) {
    color = 'bg-blue-500';
    label = 'Fair';
  } else if (score >= 25) {
    color = 'bg-orange-500';
    label = 'Poor';
  }

  return { score, feedback, color, label };
};

/**
 * Email validation
 */
const validateEmail = (email: string): string | undefined => {
  if (!email) return 'Email is required';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return undefined;
};

/**
 * Form validation
 */
const validateForm = (formData: FormData, isLogin: boolean): FormErrors => {
  const errors: FormErrors = {};

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (!isLogin && formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  if (!isLogin) {
    if (!formData.displayName.trim()) {
      errors.displayName = 'Display name is required';
    } else if (formData.displayName.trim().length < 2) {
      errors.displayName = 'Display name must be at least 2 characters long';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  return errors;
};

/**
 * Split Screen Login Page Component
 */
export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, redirectTo }) => {
  // Hooks
  const { login, register, enterDemoMode, error: authError, isLoading, clearError } = useAuth();
  const { setCurrentView } = useApp();

  // State
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  /**
   * Password strength calculation
   */
  const passwordStrength = useMemo(() => {
    return calculatePasswordStrength(formData.password);
  }, [formData.password]);

  /**
   * Form change handler
   */
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    if (authError) {
      clearError();
    }
  }, [formErrors, authError, clearError]);

  /**
   * Tab change handler
   */
  const handleTabChange = useCallback((tab: 'login' | 'register') => {
    setActiveTab(tab);
    setFormErrors({});
    setFormData({
      email: '',
      password: '',
      displayName: '',
      confirmPassword: ''
    });
    clearError();
  }, [clearError]);

  /**
   * Form submission handler
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm(formData, activeTab === 'login');
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      let result;
      
      if (activeTab === 'login') {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.email, formData.password, formData.displayName);
      }

      if (result.success) {
        onSuccess?.();
      } else {
        setFormErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setFormErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, activeTab, login, register, onSuccess]);

  /**
   * Demo mode handler
   */
  const handleDemoMode = useCallback(() => {
    enterDemoMode();
    onSuccess?.();
  }, [enterDemoMode, onSuccess]);

  /**
   * Clear errors when component unmounts
   */
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const isLogin = activeTab === 'login';

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-gray-900 flex">
      {/* Left Side - Authentication Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* Title with Blue DELEGATE emphasis */}
              <div className="space-y-3">
                <h1 className="text-4xl font-bold leading-tight">
                  <span className="text-[#4682B4] dark:text-[#6BA6DC]">DELEGATE</span>{' '}
                  <span className="bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 dark:from-gray-300 dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">AI</span>
                </h1>
                
                {/* Beta Badge */}
                <div className="flex items-center justify-center">
                  <Badge variant="outline" className="border-[#5B9BD5]/30 text-[#5B9BD5] bg-[#E6F3FF] dark:border-[#5B9BD5]/40 dark:text-[#87CEEB] dark:bg-[#1A2332]/50 font-medium tracking-wider">
                    BETA
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Mode Card */}
          <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium text-indigo-900 dark:text-indigo-100">
                    Try Demo Mode
                  </h3>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    Explore all features without signing up
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDemoMode}
                  className="bg-white/80 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 dark:bg-gray-800 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
                >
                  Try Now 
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Auth Card */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="space-y-2 pb-6 text-center">
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                {isLogin ? 'Welcome Back' : 'Join Delegate AI'}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {isLogin 
                  ? 'Sign in to continue your diplomatic journey' 
                  : 'Create your account and start intelligent conversations'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Auth Tabs */}
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login" className="space-y-4 mt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`pl-10 h-11 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 ${formErrors.email ? 'border-red-500' : ''}`}
                          disabled={isSubmitting}
                          autoComplete="email"
                          required
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={`pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 ${formErrors.password ? 'border-red-500' : ''}`}
                          disabled={isSubmitting}
                          autoComplete="current-password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 px-3 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSubmitting}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formErrors.password && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.password}
                        </p>
                      )}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="remember-me"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="remember-me" className="text-sm text-gray-600 dark:text-gray-400">
                          Remember me
                        </Label>
                      </div>
                      <Button variant="link" className="text-blue-600 hover:text-blue-700 p-0 h-auto">
                        Forgot password?
                      </Button>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      disabled={isSubmitting || isLoading}
                    >
                      {isSubmitting || isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Sign In
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Registration Form */}
                <TabsContent value="register" className="space-y-4 mt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Display Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Display Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="Enter your name"
                          value={formData.displayName}
                          onChange={(e) => handleInputChange('displayName', e.target.value)}
                          className={`pl-10 h-11 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 ${formErrors.displayName ? 'border-red-500' : ''}`}
                          disabled={isSubmitting}
                          autoComplete="name"
                          required
                        />
                      </div>
                      {formErrors.displayName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.displayName}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`pl-10 h-11 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 ${formErrors.email ? 'border-red-500' : ''}`}
                          disabled={isSubmitting}
                          autoComplete="email"
                          required
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={`pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 ${formErrors.password ? 'border-red-500' : ''}`}
                          disabled={isSubmitting}
                          autoComplete="new-password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 px-3 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSubmitting}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formErrors.password && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.password}
                        </p>
                      )}

                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Password strength</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-2 py-0 ${
                                passwordStrength.score >= 75 ? 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:border-emerald-400 dark:text-emerald-300 dark:bg-emerald-950/30' :
                                passwordStrength.score >= 50 ? 'border-blue-500 text-blue-700 bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:bg-blue-950/30' :
                                passwordStrength.score >= 25 ? 'border-orange-500 text-orange-700 bg-orange-50 dark:border-orange-400 dark:text-orange-300 dark:bg-orange-950/30' :
                                'border-red-500 text-red-700 bg-red-50 dark:border-red-400 dark:text-red-300 dark:bg-red-950/30'
                              }`}
                            >
                              {passwordStrength.label}
                            </Badge>
                          </div>
                          <Progress 
                            value={passwordStrength.score} 
                            className="h-2"
                          />
                          {passwordStrength.feedback.length > 0 && (
                            <ul className="text-xs text-gray-500 space-y-1">
                              {passwordStrength.feedback.map((item, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className={`pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                          disabled={isSubmitting}
                          autoComplete="new-password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 px-3 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isSubmitting}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.confirmPassword}
                        </p>
                      )}
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <p className="text-sm text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Passwords match
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      disabled={isSubmitting || isLoading}
                    >
                      {isSubmitting || isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Create Account
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Error Display */}
              {(authError || formErrors.general) && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {authError || formErrors.general}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <button 
                onClick={() => setCurrentView?.('legal')}
                className="underline hover:text-blue-600 transition-colors"
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <button 
                onClick={() => setCurrentView?.('privacy')}
                className="underline hover:text-blue-600 transition-colors"
              >
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Community Announcements (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2">
        <CommunityAnnouncements />
      </div>
    </div>
  );
};

export default LoginPage;