import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gold/3 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md fade-in">
        <div className="rounded-xl border border-charcoal-lighter bg-charcoal-light p-8 shadow-2xl">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/20">
              <Palette size={28} className="text-gold" />
            </div>
            <h1 className="font-display text-2xl font-bold text-cream">策展协作平台</h1>
            <p className="mt-1 text-sm text-gray-400">艺术展览管理系统</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-coral/10 px-4 py-2 text-sm text-coral">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-charcoal-lighter bg-charcoal px-4 py-2.5 text-sm text-cream placeholder-gray-500 outline-none transition-colors focus:border-gold"
                placeholder="请输入用户名"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-charcoal-lighter bg-charcoal px-4 py-2.5 pr-10 text-sm text-cream placeholder-gray-500 outline-none transition-colors focus:border-gold"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cream"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-gold-light disabled:opacity-50"
            >
              {isLoading ? '登录中...' : '登 录'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            策展协作平台 &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
