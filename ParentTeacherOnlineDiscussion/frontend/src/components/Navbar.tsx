import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Home, Calendar, Clock, Users, LogOut, User, BookOpen } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const teacherLinks = [
    { path: '/teacher/dashboard', label: '首页', icon: Home },
    { path: '/teacher/slots', label: '时段管理', icon: Clock },
    { path: '/teacher/appointments', label: '预约列表', icon: Calendar },
  ];

  const parentLinks = [
    { path: '/parent/dashboard', label: '首页', icon: Home },
    { path: '/parent/teachers', label: '老师列表', icon: Users },
    { path: '/parent/appointments', label: '我的预约', icon: Calendar },
  ];

  const links = user?.role === 'teacher' ? teacherLinks : parentLinks;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={user?.role === 'teacher' ? '/teacher/dashboard' : '/parent/dashboard'} className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">家校交流平台</span>
            </Link>

            <div className="hidden md:ml-10 md:flex md:space-x-4">
              {links.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">
                {user?.name} ({user?.role === 'teacher' ? '老师' : '家长'})
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {links.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                isActive(path)
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
