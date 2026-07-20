import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Form, Input, Button } from 'antd';
import { Mail, Lock } from 'lucide-react';

export async function loader() {
  return null;
}

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      showSuccess('Signed in successfully');
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBg text-gray-100 font-sans relative overflow-hidden px-4 select-none">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-accentBlue/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-accentPurple/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel border border-slate-800/60 rounded-3xl p-8 shadow-2xl relative z-10 bg-slate-900/30 backdrop-blur-md">
        <div className="flex flex-col items-center mb-8">
          <h2 className="font-bold text-2xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            CMS Admin Portal
          </h2>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          className="space-y-4"
        >
          <Form.Item
            label={<span className="text-gray-300 font-semibold text-xs uppercase tracking-wider">Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'The input is not a valid email!' }
            ]}
          >
            <Input
              prefix={<Mail className="w-4 h-4 text-gray-500 mr-1 shrink-0" />}
              placeholder="admin@example.com"
              size="large"
              className="rounded-xl h-11"
            />
          </Form.Item>

          <Form.Item
            label={
              <div className="flex justify-between items-center w-full">
                <span className="text-gray-300 font-semibold text-xs uppercase tracking-wider">Password</span>
              </div>
            }
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<Lock className="w-4 h-4 text-gray-500 mr-1 shrink-0" />}
              placeholder="Enter password..."
              size="large"
              className="rounded-xl h-11"
            />
          </Form.Item>

          <Form.Item className="pt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="h-11 rounded-xl bg-gradient-to-r from-accentBlue to-accentPurple border-0 font-bold hover:brightness-110 transition-all"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
