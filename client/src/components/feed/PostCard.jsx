import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Flag, Clock, Bookmark } from 'lucide-react';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { getImageUrl } from '../../lib/axios';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const isOwner = post.author?._id === user?._id;
  const isAdmin = user?.role === 'COLLEGE_ADMIN' || user?.role === 'SUPER_ADMIN';
  const canDelete = isOwner || isAdmin;

  const handleLike = async () => {
    try {
      setLikeAnimating(true);
      const res = await api.post(`/posts/${post._id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
      setTimeout(() => setLikeAnimating(false), 300);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success('Post deleted');
      onDelete?.(post._id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const categoryBadge = post.category && post.category !== 'GENERAL' && (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary-500/20 text-primary-300">
      {post.category}
    </span>
  );

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:border-primary-500/30 hover:-translate-y-1 hover:shadow-glow-lg transition-all duration-300 animate-fade-in group/card">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <Link to={`/profile/${post.author?._id}`} className="flex items-center gap-3 group">
          {post.author?.avatar ? (
            <img src={getImageUrl(post.author.avatar)} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-primary-500/50 transition-all" />
          ) : (
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white">
              {post.author?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {post.author?.name}
              </p>
              {categoryBadge}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{post.author?.department}</span>
              {post.author?.department && post.author?.year && <span>•</span>}
              <span>{post.author?.year}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </Link>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-10 animate-scale-in">
              {canDelete && (
                <button
                  onClick={() => { handleDelete(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-gray-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Post
                </button>
              )}
              <button
                onClick={() => setShowMenu(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-all"
              >
                <Flag className="w-3.5 h-3.5" />
                Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
        {post.content}
      </p>

      {/* Images */}
      {post.images?.length > 0 && (
        <div className={`mb-3 rounded-xl overflow-hidden ${post.images.length > 1 ? 'grid grid-cols-2 gap-1' : ''}`}>
          {post.images.map((img, i) => (
            <img
              key={i}
              src={getImageUrl(img)}
              alt=""
              className="w-full h-auto max-h-80 object-cover"
              loading="lazy"
            />
          ))}
        </div>
      )}

      {/* Club badge */}
      {post.club && (
        <Link
          to={`/clubs/${post.club._id || post.club}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-lg bg-gray-100 text-xs text-gray-600 hover:text-primary-600 transition-colors"
        >
          🏛 {post.club.name || 'Club post'}
        </Link>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
            liked
              ? 'text-red-500 bg-red-50'
              : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${liked ? 'fill-current' : ''} ${likeAnimating ? 'like-animation' : ''}`}
          />
          <span className="text-xs font-medium">{likesCount}</span>
        </button>

        <Link
          to={`/posts/${post._id || '#'}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-medium">{post.commentsCount || 0}</span>
        </Link>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all ml-auto">
          <Bookmark className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
