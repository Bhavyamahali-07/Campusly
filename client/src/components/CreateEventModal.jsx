import { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function CreateEventModal({ isOpen, onClose, onEventCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
  });
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
      if (posterFile) {
        submitData.append('poster', posterFile);
      }

      const res = await api.post('/events', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Event created successfully!');
      onEventCreated(res.data.event);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-surface-800">
          <h2 className="text-xl font-bold font-[var(--font-display)] text-white">Create Event</h2>
          <button onClick={onClose} className="p-1 text-surface-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1">Event Poster</label>
            <div className="flex items-center gap-4">
              {posterPreview ? (
                <div className="relative w-32 h-20 rounded-lg overflow-hidden group">
                  <img src={posterPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => { setPosterFile(null); setPosterPreview(null); }}
                      className="text-white hover:text-danger-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="w-32 h-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-surface-600 hover:border-primary-500 hover:bg-surface-800 transition-colors cursor-pointer text-surface-400">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-[10px]">Upload Image</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setPosterFile(file);
                        setPosterPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1">Event Title *</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-surface-800 border border-surface-700 rounded-xl focus:outline-none focus:border-primary-500 text-surface-100"
              placeholder="e.g. Annual Tech Symposium"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-surface-800 border border-surface-700 rounded-xl focus:outline-none focus:border-primary-500 text-surface-100"
              placeholder="What is this event about?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Date *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-surface-800 border border-surface-700 rounded-xl focus:outline-none focus:border-primary-500 text-surface-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 bg-surface-800 border border-surface-700 rounded-xl focus:outline-none focus:border-primary-500 text-surface-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 bg-surface-800 border border-surface-700 rounded-xl focus:outline-none focus:border-primary-500 text-surface-100"
              placeholder="e.g. Main Auditorium"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-surface-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
