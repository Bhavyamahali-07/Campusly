import { useState } from 'react';
import { Image, Send, X, Smile } from 'lucide-react';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import { POST_CATEGORIES } from '../../lib/constants';
import toast from 'react-hot-toast';

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuthStore();
  const { createPostModalOpen, setCreatePostModal } = useUIStore();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!createPostModalOpen) return null;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim()) return toast.error('Post content is required');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('category', category);
      images.forEach((img) => formData.append('images', img));

      const res = await api.post('/posts', formData);

      toast.success('Post created! 🎉');
      onPostCreated?.(res.data.post);
      setContent('');
      setCategory('GENERAL');
      setImages([]);
      setPreviews([]);
      setCreatePostModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCreatePostModal(false)} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white shadow-xl rounded-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create Post</h2>
          <button
            onClick={() => setCreatePostModal(false)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.department} • {user?.year}</p>
            </div>
          </div>

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening on campus? Share your thoughts, achievements, or questions..."
            rows={4}
            className="w-full bg-transparent border-none text-gray-900 placeholder:text-gray-400 text-sm leading-relaxed resize-none focus:outline-none"
            autoFocus
          />

          {/* Image previews */}
          {previews.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
              {previews.map((src, i) => (
                <div key={i} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Category */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {POST_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  category === cat.value
                    ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-500/30'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <label className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer">
              <Image className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <button className="p-2 rounded-lg text-gray-500 hover:text-amber-500 hover:bg-amber-50 transition-all">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 disabled:opacity-40 transition-all"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Post
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
