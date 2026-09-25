import { useState, useEffect, useRef } from 'react';
import api from '../lib/axios';
import { Send, MessageSquare, ArrowLeft, Info, X, Shield, UserMinus, ShieldAlert, ShieldCheck, Image as ImageIcon, Smile, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { Link } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';

export default function Discussions() {
  const { user } = useAuthStore();
  const [clubs, setClubs] = useState([]);
  const [activeClub, setActiveClub] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [clubMembers, setClubMembers] = useState([]);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    if (activeClub) {
      fetchMessages(activeClub._id);
    }
  }, [activeClub]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeClub && showInfo) {
      fetchGroupInfo(activeClub._id);
    }
  }, [activeClub, showInfo]);

  const fetchGroupInfo = async (clubId) => {
    setLoadingInfo(true);
    try {
      const res = await api.get(`/clubs/${clubId}`);
      setClubMembers(res.data.members || []);
    } catch (err) {
      toast.error('Failed to load group info');
    } finally {
      setLoadingInfo(false);
    }
  };

  const handlePromoteMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to make ${memberName} an Admin?`)) return;
    try {
      await api.patch(`/clubs/${activeClub._id}/members/${memberId}`, { action: 'promote' });
      setClubMembers(clubMembers.map(m => m._id === memberId ? { ...m, role: 'ADMIN' } : m));
      toast.success(`${memberName} is now an Admin`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to promote member');
    }
  };

  const handleDemoteMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to dismiss ${memberName} as Admin?`)) return;
    try {
      await api.patch(`/clubs/${activeClub._id}/members/${memberId}`, { action: 'demote' });
      setClubMembers(clubMembers.map(m => m._id === memberId ? { ...m, role: 'MEMBER' } : m));
      toast.success(`${memberName} is now a Member`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to demote member');
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName}?`)) return;
    try {
      await api.patch(`/clubs/${activeClub._id}/members/${memberId}`, { action: 'remove' });
      setClubMembers(clubMembers.filter(m => m._id !== memberId));
      toast.success(`${memberName} removed from the group`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const fetchClubs = async () => {
    try {
      const res = await api.get('/clubs');
      // filter only clubs where user is active member or admin
      const myClubs = (res.data || []).filter(c => 
        c.isMember || user?.role === 'COLLEGE_ADMIN' || user?.role === 'SUPER_ADMIN'
      );
      setClubs(myClubs);
      if (myClubs.length > 0) setActiveClub(myClubs[0]);
    } catch (err) {
      toast.error('Failed to load clubs');
    } finally {
      setLoadingClubs(false);
    }
  };

  const fetchMessages = async (clubId) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/discussions/${clubId}`);
      setMessages(res.data || []);
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;

    try {
      const res = await api.post(`/discussions/${activeClub._id}`, { content: newMessage, image: selectedImage });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      setSelectedImage(null);
      setShowEmojiPicker(false);
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Delete this message for everyone?')) return;
    try {
      await api.delete(`/discussions/${activeClub._id}/messages/${msgId}`);
      setMessages(messages.map(m => m._id === msgId ? { ...m, isDeleted: true, content: 'This message was deleted', image: '' } : m));
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error('Image must be less than 2MB');
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const formatLastActive = (date) => {
    const diff = new Date() - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 5) return 'Online';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loadingClubs) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
          <MessageSquare className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold font-[var(--font-display)] text-gray-900 mb-2">No Discussions Yet</h2>
        <p className="text-gray-500">
          {(user?.role === 'COLLEGE_ADMIN' || user?.role === 'SUPER_ADMIN') 
            ? "There are no approved clubs in the system yet." 
            : "Join a club to participate in its discussion group!"}
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] -mt-2 -mx-4 sm:mx-0 sm:mt-0 flex bg-white sm:rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Clubs List Sidebar */}
      <div className={`w-full sm:w-80 border-r border-gray-200 flex flex-col bg-gray-50 ${activeClub ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-lg font-[var(--font-display)] text-gray-900">My Clubs</h2>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {clubs.map(club => (
            <button
              key={club._id}
              onClick={() => setActiveClub(club)}
              className={`w-full text-left p-4 flex items-center gap-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0 ${activeClub?._id === club._id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}`}
            >
              {club.logo ? (
                <img src={club.logo} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20" />
              ) : (
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold ring-2 ring-blue-500/20">
                  {club.name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate text-gray-900">{club.name}</h3>
                <p className="text-xs text-gray-500 truncate">{club.category}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {activeClub && (
        <div className={`flex-1 flex flex-col bg-white ${!activeClub ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
            <button onClick={() => setActiveClub(null)} className="sm:hidden p-1 -ml-1 text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            {activeClub.logo ? (
              <img src={activeClub.logo} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20" />
            ) : (
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold ring-2 ring-blue-500/20">
                {activeClub.name[0]}
              </div>
            )}
            <div className="flex-1 cursor-pointer" onClick={() => setShowInfo(true)}>
              <h2 className="font-bold text-gray-900 hover:underline">{activeClub.name}</h2>
              <p className="text-xs text-gray-500">{activeClub.membersCount} members</p>
            </div>
            <button onClick={() => setShowInfo(!showInfo)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <Info className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
            {loadingMessages ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No messages yet. Be the first to start the conversation!
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.user._id === user._id;
                const isSystemAdmin = user.role === 'COLLEGE_ADMIN' || user.role === 'SUPER_ADMIN';
                const isGroupAdmin = isSystemAdmin || activeClub.memberRole === 'ADMIN';
                const canDelete = isMe || isGroupAdmin;
                return (
                  <div key={msg._id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} animate-scale-in group/msg`}>
                    {!isMe && (
                      msg.user.avatar ? (
                        <img src={msg.user.avatar} className="w-8 h-8 rounded-full flex-shrink-0 object-cover" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-full gradient-primary flex-shrink-0 flex items-center justify-center text-xs text-white font-medium">
                          {msg.user.name[0]}
                        </div>
                      )
                    )}
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!isMe && <span className="text-xs text-gray-500 mb-1 ml-1">{msg.user.name}</span>}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.isDeleted ? 'bg-gray-100 text-gray-400 italic border border-gray-200' : isMe ? 'bg-blue-600 text-white rounded-br-sm shadow-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm border border-gray-200'}`}>
                        {msg.image && (
                          <img src={msg.image} alt="uploaded" className="max-w-full rounded-xl mb-2 max-h-60 object-contain bg-black/5" />
                        )}
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-2 mt-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px] text-gray-500">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {canDelete && !msg.isDeleted && (
                          <button onClick={() => handleDeleteMessage(msg._id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="relative border-t border-gray-200 bg-white">
            {selectedImage && (
              <div className="absolute bottom-full left-0 p-3 bg-white rounded-tr-2xl border border-gray-200 shadow-sm">
                <div className="relative">
                  <img src={selectedImage} alt="Preview" className="h-20 rounded object-cover" />
                  <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                </div>
              </div>
            )}
            
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 right-4 z-50 shadow-2xl">
                <EmojiPicker theme="light" onEmojiClick={(e) => setNewMessage(prev => prev + e.emoji)} />
              </div>
            )}

            <form onSubmit={handleSendMessage} className="p-3 flex items-end gap-3">
              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              
              <label className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
                <ImageIcon className="w-5 h-5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>

              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message the group..."
                  className="w-full bg-transparent border-none py-2 text-sm focus:outline-none text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={(!newMessage.trim() && !selectedImage) || loadingMessages}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-full transition-all flex-shrink-0 shadow-sm"
              >
                <Send className="w-5 h-5 -ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Group Info Sidebar (WhatsApp style) */}
      {activeClub && showInfo && (
        <div className="w-full sm:w-80 border-l border-gray-200 flex flex-col bg-white absolute right-0 h-full sm:relative z-10 shadow-lg sm:shadow-none">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="font-bold text-lg text-gray-900">Group Info</h2>
            <button onClick={() => setShowInfo(false)} className="p-1 text-gray-500 hover:text-gray-900 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <div className="p-6 flex flex-col items-center border-b border-gray-200 text-center bg-white">
              {activeClub.logo ? (
                <img src={activeClub.logo} alt="" className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-gray-50" />
              ) : (
                <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-3xl text-white font-bold mb-4 ring-4 ring-gray-50">
                  {activeClub.name[0]}
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900">{activeClub.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{activeClub.category} • {clubMembers.length} members</p>
              <Link to={`/clubs/${activeClub._id}`} className="text-sm text-blue-600 hover:underline">
                View Full Club Page
              </Link>
            </div>

            <div className="p-4 bg-white">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Members</h3>
              {loadingInfo ? (
                <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <div className="space-y-1">
                  {clubMembers.map(member => {
                    const isGroupAdmin = user.role === 'COLLEGE_ADMIN' || user.role === 'SUPER_ADMIN' || activeClub.memberRole === 'ADMIN';
                    const canManage = isGroupAdmin && member._id !== user._id && member._id !== activeClub.admin?._id;

                    return (
                      <div key={member._id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-3">
                          {member.avatar ? (
                            <img src={member.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                              {member.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-gray-900">{member.name}</span>
                              {member.role === 'ADMIN' && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-600">Admin</span>}
                            </div>
                            <span className="text-xs text-gray-500 truncate w-32">{member.department || 'Student'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] ${formatLastActive(member.lastActive) === 'Online' ? 'text-green-600' : 'text-gray-400'}`}>
                            {formatLastActive(member.lastActive)}
                          </span>
                          
                          {canManage && (
                          <div className="hidden group-hover:flex items-center gap-1">
                            {member.role !== 'ADMIN' ? (
                              <button onClick={() => handlePromoteMember(member._id, member.name)} title="Make Admin" className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                            ) : (
                              <button onClick={() => handleDemoteMember(member._id, member.name)} title="Dismiss as Admin" className="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-md">
                                <ShieldAlert className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => handleRemoveMember(member._id, member.name)} title="Remove from Group" className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md">
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
