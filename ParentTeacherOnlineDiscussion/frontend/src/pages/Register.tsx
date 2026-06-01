import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';
import { User, Lock, Mail, Phone, BookOpen, GraduationCap, AlertCircle, ArrowLeft } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    phone: '',
    role: 'teacher' as UserRole,
    subject: '',
    grade: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, loading, error, isAuthenticated, user, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'teacher' ? '/teacher/dashboard' : '/parent/dashboard';
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名';
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少3个字符';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少6位';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次密码输入不一致';
    }

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }

    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号';
    }

    if (formData.role === 'teacher' && !formData.subject.trim()) {
      newErrors.subject = '请输入所教科目';
    }

    if (formData.role === 'parent' && !formData.grade.trim()) {
      newErrors.grade = '请输入孩子年级';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const { confirmPassword, ...submitData } = formData;
      await register(submitData);
    } catch (err) {
      console.error('Register failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link
          to="/login"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回登录
        </Link>

        <div className="text-center mb-8">
          <div className="flex justify-center">
            <BookOpen className="h-16 w-16 text-primary-600" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">注册新账户</h2>
          <p className="mt-2 text-sm text-gray-600">创建您的家校交流平台账户</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: 'teacher' }))}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                formData.role === 'teacher'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              老师
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: 'parent' }))}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                formData.role === 'parent'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              家长
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`input-field ${errors.username ? 'border-red-500' : ''}`}
                  placeholder="用户名"
                />
                {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="真实姓名"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field pl-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="至少6位"
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="再次输入"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline h-4 w-4 mr-1" />
                  邮箱
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="example@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline h-4 w-4 mr-1" />
                  手机号
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="13800138000"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>
            </div>

            {formData.role === 'teacher' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所教科目</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`input-field ${errors.subject ? 'border-red-500' : ''}`}
                  placeholder="如：语文、数学、英语"
                />
                {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">孩子年级</label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className={`input-field ${errors.grade ? 'border-red-500' : ''}`}
                  placeholder="如：三年级一班"
                />
                {errors.grade && <p className="mt-1 text-sm text-red-500">{errors.grade}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '注 册'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              已有账户？
              <Link
                to="/login"
                className="ml-1 text-primary-600 hover:text-primary-700 font-medium"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
