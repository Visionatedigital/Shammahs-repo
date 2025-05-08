'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/Icons';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  createdAt: string;
  views: number;
  tags: string[];
  isPinned: boolean;
  type: 'update' | 'maintenance' | 'event' | 'feature';
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

export default function AnnouncementsPage() {
  const { data: session, status } = useSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'update' | 'event' | 'maintenance'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'update' as 'update' | 'maintenance' | 'event' | 'feature',
    tags: [] as string[],
    isPinned: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsRes, eventsRes] = await Promise.all([
          fetch('/api/community/posts?category=announcements'),
          fetch('/api/events/upcoming'),
        ]);

        if (!postsRes.ok) {
          throw new Error('Failed to fetch announcements');
        }

        if (!eventsRes.ok) {
          throw new Error('Failed to fetch events');
        }

        const [postsData, eventsData] = await Promise.all([
          postsRes.json(),
          eventsRes.json(),
        ]);

        if (!postsData.posts) {
          throw new Error('Invalid posts data format');
        }

        // Transform the posts data to match our Announcement interface
        const transformedAnnouncements = postsData.posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          type: post.type || 'update',
          tags: post.tags || [],
          isPinned: post.isPinned || false,
          views: post.viewsCount || 0,
          createdAt: post.createdAt,
          author: {
            id: post.author.id,
            name: post.author.name || 'Unknown',
            image: post.author.image || '/default-avatar.png',
          },
        }));

        setAnnouncements(transformedAnnouncements);
        setEvents(eventsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        toast.error('Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateAnnouncement = async () => {
    try {
      const response = await fetch('/api/community/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAnnouncement),
      });

      if (!response.ok) {
        throw new Error('Failed to create announcement');
      }

      const data = await response.json();
      setAnnouncements([data.announcement, ...announcements]);
      setShowCreateModal(false);
      setNewAnnouncement({
        title: '',
        content: '',
        type: 'update',
        tags: [],
        isPinned: false,
      });
      toast.success('Announcement created successfully!');
    } catch (err) {
      toast.error('Failed to create announcement');
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => 
    activeFilter === 'all' || announcement.type === activeFilter
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        {session?.user?.email?.endsWith('@studiosix.com') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Create Announcement
          </button>
        )}
      </div>

      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Filter Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            {(['all', 'update', 'event', 'maintenance'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 font-medium text-sm ${
                  activeFilter === filter
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Announcements List */}
          <div className="space-y-6">
            {filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className={`bg-white rounded-xl border ${
                  announcement.isPinned ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
                } p-6`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      announcement.type === 'update' ? 'bg-blue-100 text-blue-600' :
                      announcement.type === 'maintenance' ? 'bg-yellow-100 text-yellow-600' :
                      announcement.type === 'event' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <Icon
                        name={
                          announcement.type === 'update' ? 'update' :
                          announcement.type === 'maintenance' ? 'maintenance' :
                          announcement.type === 'event' ? 'event' :
                          'feature'
                        }
                        size={20}
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 hover:text-purple-600 cursor-pointer">
                        {announcement.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">
                          {announcement.author.name}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">
                          {announcement.views} views
                        </span>
                      </div>
                    </div>
                  </div>
                  {announcement.isPinned && (
                    <div className="text-purple-600">
                      <Icon name="pin" size={20} />
                    </div>
                  )}
                </div>

                <p className="mt-4 text-gray-600">{announcement.content}</p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    {announcement.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 font-medium">
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <div className="mt-1 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Icon name="calendar" size={16} />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Icon name="clock" size={16} />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Icon name="location" size={16} />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Create New Announcement</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Enter announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  rows={6}
                  placeholder="Write your announcement content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newAnnouncement.type}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="update">Update</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="event">Event</option>
                  <option value="feature">New Feature</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <input
                  type="text"
                  value={newAnnouncement.tags.join(', ')}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Enter tags separated by commas"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newAnnouncement.isPinned}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isPinned: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Pin this announcement</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnouncement}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 