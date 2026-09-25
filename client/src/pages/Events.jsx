import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Plus, Search, ExternalLink } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import useAuthStore from '../store/authStore';
import CreateEventModal from '../components/CreateEventModal';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events?upcoming=true');
        setEvents(res.data || []);
      } catch {
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`);
      toast.success('Registered successfully! 🎉');
      setEvents(events.map(e => e._id === eventId ? { ...e, isRegistered: true, registrationCount: e.registrationCount + 1 } : e));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-display)] text-gray-900">Events</h1>
          <p className="text-gray-500 text-sm mt-1">Discover what's happening on campus</p>
        </div>
        {user?.role !== 'STUDENT' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white shadow-sm border border-gray-100 rounded-2xl p-5 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-xl mb-4" />
              <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No upcoming events</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div key={event._id} className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-md transition-all group">
              {/* Poster */}
              {event.poster ? (
                <img src={event.poster} alt="" className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-blue-200" />
                </div>
              )}

              <div className="p-5">
                {/* Status badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                    event.status === 'UPCOMING' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                    event.status === 'ONGOING' ? 'bg-green-50 text-green-600 border border-green-100' :
                    'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    {event.status}
                  </span>
                  {event.club && (
                    <span className="text-xs text-gray-500">by {event.club.name}</span>
                  )}
                </div>

                <Link to={`/events/${event._id}`} className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                  {event.title}
                </Link>

                <p className="text-xs text-gray-600 line-clamp-2 mt-1 mb-3">{event.description}</p>

                {/* Meta */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(event.date), 'MMM dd, yyyy')}
                    {event.time && ` at ${event.time}`}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="w-3.5 h-3.5" />
                    {event.registrationCount} registered
                    {event.maxParticipants > 0 && ` / ${event.maxParticipants}`}
                  </div>
                </div>

                {/* Register */}
                {event.isRegistered ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-green-50 text-green-600 border border-green-200">
                    ✓ Registered
                  </span>
                ) : (
                  <button
                    onClick={() => handleRegister(event._id)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
                  >
                    Register
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={(newEvent) => {
          // Sort events by date after adding the new one
          const updatedEvents = [...events, newEvent].sort((a, b) => new Date(a.date) - new Date(b.date));
          setEvents(updatedEvents);
        }}
      />
    </div>
  );
}
