import React, { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { publicService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowLeft, Loader, CheckCircle } from 'lucide-react';

export async function loader() {
  return null;
}

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showSuccess, showError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await publicService.forgotPassword(data.email);
      setSuccess(true);
      showSuccess('Reset instructions sent if email exists');
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'An error occurred. Please try again.');
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
            Forgot Password
          </h2>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Enter your email to receive password reset instructions
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-successGreen/15 border border-successGreen/25 rounded-full flex items-center justify-center mx-auto text-successGreen animate-pulse-none shadow-lg shadow-successGreen/5">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Check Your Mailbox / Server Logs</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                If the email address is registered, we have sent instructions to reset your password.
              </p>
              <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-left text-xs text-gray-500 font-mono mt-4">
                <span className="text-amber-500 font-semibold">Dev Tip:</span> Since SMTP is in log-only mode during dev, check the backend terminal output or container log to retrieve the token.
              </div>
            </div>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-accentBlue hover:text-accentBlue/80 transition-all mt-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-dangerRed mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-accentBlue to-accentPurple hover:from-accentBlue/90 hover:to-accentPurple/90 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accentBlue/10 transition-all duration-200 disabled:opacity-55"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                <span>Send Reset Link</span>
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

export default ForgotPassword;
