import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Compass } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function Discover() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [trendingSkills] = useState(['React', 'Python', 'AI', 'UI/UX', 'Machine Learning', 'Node.js', 'Data Science', 'Figma', 'Marketing', 'Photography']);

  const handleSearch = async (q) => {
    if (q.length < 2) { setResults(null); return; }
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
      setResults(res.data || []);
    } catch {}
  };

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-[var(--font-display)] text-gray-900">Discover Students</h1>
        <p className="text-gray-500 text-sm mt-1">Find collaborators by skill, name, or department</p>
      </div>

      <div className="relative max-w-lg mx-auto mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by skill (e.g. React, Python, UI/UX)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white shadow-sm border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
        />
      </div>

      {/* Trending skills */}
      {!results && (
        <div className="text-center mb-8">
          <p className="text-xs text-gray-500 mb-3 uppercase font-semibold tracking-wider">Popular Skills</p>
          <div className="flex flex-wrap justify-center gap-2">
            {trendingSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => setQuery(skill)}
                className="px-3 py-1.5 rounded-xl text-sm bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Compass className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              No students found
            </div>
          ) : (
            results.map((user) => (
              <Link
                key={user._id}
                to={`/profile/${user._id}`}
                className="bg-white shadow-sm border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all text-center"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-xl font-bold text-white mx-auto mb-3 shadow-sm">
                    {user.name?.[0]}
                  </div>
                )}
                <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {user.department} {user.year && `• ${user.year}`}
                </p>
                <div className="flex flex-wrap justify-center gap-1 mt-3">
                  {user.skills?.slice(0, 3).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-md text-[10px] bg-blue-50 text-blue-600 border border-blue-100">{s}</span>
                  ))}
                </div>
                <p className="text-xs text-amber-500 font-bold mt-2">🔥 {user.activityPoints} XP</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
