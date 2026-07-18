import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { publicService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Lock, Eye, EyeOff, Loader, CheckCircle, ArrowLeft } from 'lucide-react';

export async function loader() {
  return null;
}

const schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!token) {
      showError('Invalid or missing security token in URL');
    }
  }, [token, showError]);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      showError('No token provided. Cannot reset password.');
      return;
    }

    setLoading(true);
    try {
      await publicService.resetPassword(token, data.password);
      setSuccess(true);
      showSuccess('Password reset successfully');
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to reset password. Token may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBg text-gray-100 font-sans relative overflow-hidden px-4">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-accentBlue/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-accentPurple/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel border border-slate-800/60 rounded-3xl p-8 shadow-2xl relative z-10 bg-slate-900/30 backdrop-blur-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accentBlue to-accentPurple flex items-center justify-center shadow-lg shadow-accentBlue/20 mb-4">
            <span className="font-bold text-white text-lg">B</span>
          </div>
          <h2 className="font-bold text-2xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Reset Password
          </h2>
          <p className="text-sm text-gray-500 mt-1">Enter your new security credentials</p>
        </div>

        {!token ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-sm text-dangerRed">
              This link is invalid or has expired. Please request a new password reset link.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accentBlue hover:text-accentBlue/80 transition-colors"
            >
              Request new link
            </Link>
          </div>
        ) : success ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-successGreen/15 border border-successGreen/25 rounded-full flex items-center justify-center mx-auto text-successGreen">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Password Updated</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your password has been changed successfully. You can now log in with your new credentials.
              </p>
            </div>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 py-2.5 w-full bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 text-white rounded-xl text-sm font-semibold transition-all mt-6"
            >
              Go to Login Page
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password..."
                  {...register('password')}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-dangerRed mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-type new password..."
                  {...register('confirmPassword')}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-dangerRed mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-accentBlue to-accentPurple hover:from-accentBlue/90 hover:to-accentPurple/90 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accentBlue/10 transition-all duration-200 disabled:opacity-55"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                <span>Reset Password</span>
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
