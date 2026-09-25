import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { AuthLayout } from '../../components/ui/sign-in-page';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    year: '',
    securityQuestion: '',
    securityAnswer: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validations = {
    length: formData.password.length >= 6,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!/[A-Z]/.test(formData.password)) return toast.error('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(formData.password)) return toast.error('Password must contain at least one lowercase letter');
    if (!/[0-9]/.test(formData.password)) return toast.error('Password must contain at least one number');
    if (!/[^A-Za-z0-9]/.test(formData.password)) return toast.error('Password must contain at least one special character');
    if (!formData.securityQuestion) return toast.error('Please select a security question');
    if (formData.securityAnswer.trim().length < 2) return toast.error('Please provide a valid security answer');
    
    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created! Welcome to Campusly 🎉');
      navigate('/home');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>
      }
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        {/* Full Name & Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Rahul Kumar"
            className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">College Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            placeholder="you@college.edu"
            className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Dept & Year */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="CSE"
              className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
            <select
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="">Select</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
              <option>5th Year</option>
            </select>
          </div>
        </div>

        {/* Security Question & Answer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Security Question</label>
          <select
            name="securityQuestion"
            required
            value={formData.securityQuestion}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all mb-3"
          >
            <option value="">Select a security question</option>
            <option value="What was the name of your first pet?">What was the name of your first pet?</option>
            <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
            <option value="What city were you born in?">What city were you born in?</option>
            <option value="What was your childhood nickname?">What was your childhood nickname?</option>
            <option value="What is your favorite movie?">What is your favorite movie?</option>
          </select>

          <label className="block text-sm font-medium text-gray-700 mb-1.5">Security Answer</label>
          <input
            type="text"
            name="securityAnswer"
            required
            value={formData.securityAnswer}
            onChange={handleInputChange}
            placeholder="Your answer"
            className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Min 6 chars, 1 uppercase, 1 special..."
              className="w-full px-4 py-3 pr-10 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              {showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
            </button>
          </div>

          <div className="mt-3 space-y-1.5 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div className={`flex items-center gap-2 transition-colors ${validations.length ? 'text-green-600' : 'text-gray-500'}`}>
              {validations.length ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} At least 6 characters
            </div>
            <div className={`flex items-center gap-2 transition-colors ${validations.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
              {validations.uppercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} One uppercase letter
            </div>
            <div className={`flex items-center gap-2 transition-colors ${validations.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
              {validations.lowercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} One lowercase letter
            </div>
            <div className={`flex items-center gap-2 transition-colors ${validations.number ? 'text-green-600' : 'text-gray-500'}`}>
              {validations.number ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} One number
            </div>
            <div className={`flex items-center gap-2 transition-colors ${validations.special ? 'text-green-600' : 'text-gray-500'}`}>
              {validations.special ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} One special character
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex justify-center items-center h-12"
      >
        {loading ? (
          <div className="flex justify-center items-center gap-1.5">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
        ) : (
          'Create Account'
        )}
      </button>
    </AuthLayout>
  );
}
