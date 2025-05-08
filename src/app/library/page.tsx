'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon } from '@/components/Icons';
import Image from 'next/image';
import { getRandomProfileIcon } from '@/utils/profileIcons';
import { useSession } from 'next-auth/react';
import ShareModal from '@/components/ShareModal';
import { useRouter } from 'next/navigation';
import { Post } from '../../types';
import { PostCard } from '@/components/PostCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { toast } from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ThreadDisplay } from '@/components/community/ThreadDisplay';

// Define interfaces at the top level
interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
}

interface SelectedFile {
  file: File;
  type: string;
  preview?: string;
}

// Add new interfaces for community features
interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    image: string;
    role?: string;
    reputation?: number;
  };
  category: CommunityCategory;
  createdAt: string;
  repliesCount: number;
  viewsCount: number;
  upvotes: number;
  tags: string[];
  isPinned?: boolean;
  isResolved?: boolean;
  promptUsed?: string;
  workflow?: string;
  imageUrl?: string;
  status?: 'in-progress' | 'under-review' | 'completed';
}

interface CommunityReaction {
  type: 'like' | 'heart' | 'fire';
  count: number;
  hasReacted: boolean;
}

// Add new interfaces for threads and polls
interface Thread {
  id: string;
  name: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  isPrivate: boolean;
  messages: ThreadMessage[];
}

interface ThreadMessage {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
}

interface Poll {
  id: string;
  question: string;
  answers: {
    id: string;
    text: string;
    votes: number;
  }[];
  totalVotes: number;
  duration: number; // in hours
  createdAt: string;
  endsAt: string;
  allowMultipleAnswers: boolean;
  author: {
    id: string;
    name: string;
    image: string;
  };
}

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #E0DAF3;
    border-radius: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #814ADA;
  }
`;

// Level badge mapping
const levelBadges: Record<number, string> = {
  1: '/level-icons/Level-icon-01.svg',
  2: '/level-icons/Level-icon-02.svg',
  3: '/level-icons/Level-icon-03.svg',
  4: '/level-icons/Level-icon-04.svg',
  5: '/level-icons/Level-icon-04.svg'
};

type SubscriptionStatus = 'FREE' | 'PRO' | 'ENTERPRISE' | 'CANCELLED';

interface Session {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    bannerImage?: string | null;
    credits: number;
    level: number;
    verified: boolean;
    subscriptionStatus: SubscriptionStatus;
    hasCompletedOnboarding: boolean;
    role?: 'admin' | 'user';
  };
}

export default function LibraryPage() {
  // Authentication and routing
  const { data: session, status } = useSession();
  const router = useRouter();

  // All useState hooks must be at the top
  const [activeTab, setActiveTab] = useState<'Community' | 'Your Images' | 'Your Feed' | 'Liked Feed' | 'Collections'>('Your Feed');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [followingStates, setFollowingStates] = useState<{ [key: string]: boolean }>({});
  const [recommendedProfiles, setRecommendedProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState<'image' | 'video' | 'document'>('image');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
  });
  const [postCollections, setPostCollections] = useState<{ [postId: string]: string[] }>({});
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [communityCategories, setCommunityCategories] = useState<CommunityCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedThread, setSelectedThread] = useState<CommunityCategory['threads'][0] | null>(null);
  const [selectedCategoryData, setSelectedCategoryData] = useState<CommunityCategory | null>(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [newPost, setNewPost] = useState<{
    title: string;
    content: string;
    category: string;
    tags: string[];
  }>({
    title: '',
    content: '',
    category: '',
    tags: [],
  });
  const [selectedFilters, setSelectedFilters] = useState<{
    type?: string;
    tags?: string[];
    status?: string;
  }>({});
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [newThread, setNewThread] = useState({
    name: '',
    initialMessage: '',
    isPrivate: false
  });
  const [newPoll, setNewPoll] = useState({
    question: '',
    answers: ['', ''],
    duration: 24,
    allowMultipleAnswers: false
  });
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('Announcements');
  const [selectedSubChannel, setSelectedSubChannel] = useState<string | null>(null);
  // Chat input state for message and file
  const [chatInput, setChatInput] = useState<string>('');
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [chatFilePreview, setChatFilePreview] = useState<string | null>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const [showAttachMenu, setShowAttachMenu] = useState<boolean>(false);
  const [chatFileAccept, setChatFileAccept] = useState<string>('');
  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const emojiList = ['👍', '😂', '❤️', '🔥', '🎉', '😮', '😢', '🙏'];

  // Backend-powered chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Add state for channel name to ID mapping
  const [channelNameToId, setChannelNameToId] = useState<Record<string, string>>({});
  const [isChannelsLoaded, setIsChannelsLoaded] = useState(false);

  // Add state for subchannel message counts
  const [subChannelCounts, setSubChannelCounts] = useState<Record<string, number>>({});

  // Add state for create menu and modals
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [showCreateThreadModal, setShowCreateThreadModal] = useState(false);

  // Add state for the floating menu
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

  // Fetch channels and build mapping on mount
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch('/api/community/channels');
        if (!res.ok) {
          throw new Error('Failed to fetch channels');
        }
        const data = await res.json();
        const map: Record<string, string> = {};
        data.channels.forEach((ch: any) => {
          map[ch.name] = ch.id;
        });
        setChannelNameToId(map);
        setIsChannelsLoaded(true);

        // Fetch message counts for each channel
        const counts: Record<string, number> = {};
        for (const channel of data.channels) {
          const messagesRes = await fetch(`/api/community/channels/${channel.id}/messages`);
          if (messagesRes.ok) {
            const messagesData = await messagesRes.json();
            counts[channel.name] = messagesData.messages?.length || 0;
          }
        }
        setSubChannelCounts(counts);
      } catch (error) {
        console.error('Error fetching channels:', error);
      }
    };
    fetchChannels();
  }, []);

  // Fetch messages when a sub-channel is selected
  useEffect(() => {
    if (!selectedSubChannel || !isChannelsLoaded) {
      console.log('Waiting for channel selection or channels to load:', { selectedSubChannel, isChannelsLoaded });
      return;
    }
    const realChannelId = channelNameToId[selectedSubChannel];
    if (!realChannelId) {
      console.error('Channel not found:', selectedSubChannel);
      return;
    }
    console.log('Fetching messages for channel:', { selectedSubChannel, realChannelId });
    setLoadingMessages(true);
    fetch(`/api/community/channels/${realChannelId}/messages`)
      .then(res => {
        console.log('Message fetch response status:', res.status);
        if (!res.ok) {
          throw new Error(`Failed to fetch messages: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Received messages:', data);
        setMessages(data.messages || []);
        // Reset the message count for this channel after viewing
        setSubChannelCounts(prev => ({
          ...prev,
          [selectedSubChannel]: 0
        }));
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
        setMessages([]);
      })
      .finally(() => setLoadingMessages(false));
  }, [selectedSubChannel, channelNameToId, isChannelsLoaded]);

  // Send message via backend, then fetch
  const handleSendMessage = async () => {
    if (!selectedSubChannel || (!chatInput.trim() && !chatFile)) return;
    const realChannelId = channelNameToId[selectedSubChannel];
    if (!realChannelId) {
      alert('Channel not found!');
      return;
    }
    let fileUrl = null;
    let fileType = null;
    if (chatFile) {
      const formData = new FormData();
      formData.append('file', chatFile);
      const uploadRes = await fetch('/api/community/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      fileUrl = uploadData.fileUrl;
      fileType = chatFile.type;
    }
    await fetch(`/api/community/channels/${realChannelId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content: chatInput, 
        fileUrl, 
        fileType 
      }),
    });
    // Fetch updated messages
    setLoadingMessages(true);
    const res = await fetch(`/api/community/channels/${realChannelId}/messages`);
    const data = await res.json();
    setMessages(data.messages || []);
    setLoadingMessages(false);
    setChatInput('');
    setChatFile(null);
    setChatFilePreview(null);
    setShowAttachMenu(false);
    setShowEmojiPicker(false);

    // Update the message count for this channel
    setSubChannelCounts(prev => ({
      ...prev,
      [selectedSubChannel]: 0 // Reset to 0 since we just viewed the messages
    }));
  };

  // Messages state per sub-channel
  type ChatReaction = { emoji: string; users: string[] };
  type ChatMessage = {
    user: string;
    avatar: string;
    content: string;
    time: string;
    file?: { url: string; type: string; name: string };
    reactions?: ChatReaction[];
  };
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, ChatMessage[]>>({
    'Product Updates': [
      { user: 'StudioSix Bot', avatar: '/default-avatar.png', content: 'Welcome to Product Updates!', time: '09:00' },
      { user: 'Alice', avatar: '/default-avatar.png', content: 'Excited for the new features!', time: '09:05' },
    ],
    'General Questions': [
      { user: 'Bob', avatar: '/default-avatar.png', content: 'How do I export my project?', time: '10:00' },
      { user: 'StudioSix Bot', avatar: '/default-avatar.png', content: 'Hi Bob! Go to File > Export.', time: '10:01' },
    ],
    // Add more initial messages for other sub-channels as needed
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const allowedFileTypes = {
    image: '.jpg,.jpeg,.png,.gif,.webp',
    video: '.mp4,.webm,.mov',
    document: '.pdf,.doc,.docx,.txt'
  };

  // Sidebar items and secondary sidebar map
  const channelSidebarItems = [
    { 
      name: 'Announcements', 
      icon: '/icons/announcements.svg',
      activeIcon: '/icons/announcements-white.svg'
    },
    { 
      name: 'Show Your Work', 
      icon: 'image',
      activeIcon: 'image-white'
    },
    { 
      name: 'Tips, Prompts & Workflows', 
      icon: '/icons/tips.svg',
      activeIcon: '/icons/tips-white.svg'
    },
    { 
      name: 'Ask the Community', 
      icon: '/icons/ask-the-community.svg',
      activeIcon: '/icons/ask-the-community-white.svg'
    },
    { 
      name: 'Bug Reports & Tech Help', 
      icon: '/icons/bug-droid.svg',
      activeIcon: '/icons/bug-droid-white.svg'
    },
    { 
      name: 'Feature Suggestions', 
      icon: '/icons/features.svg',
      activeIcon: '/icons/features-white.svg'
    },
  ];

  const secondarySidebarMap: Record<string, string[]> = {
    'Announcements': ['Product Updates', 'Release Notes', 'Event Alerts'],
    'Show Your Work': ['Interior', 'Exterior', 'Landscape', 'Floor Plan'],
    'Tips, Prompts & Workflows': ['Prompt Library', 'Workflow Ideas', 'StudioSix Hacks'],
    'Ask the Community': ['General Questions', 'Software Setup', 'Hardware Support'],
    'Bug Reports & Tech Help': ['Report a Bug', 'Known Issues', 'Troubleshooting Tips'],
    'Feature Suggestions': ['Suggest a Feature', 'In Progress', 'Under Review'],
  };

  // Channel descriptions for secondary sidebar
  const channelDescriptions: Record<string, string> = {
    'Announcements': 'Stay up to date with the latest product news and alerts.',
    'Show Your Work': 'Share your best renders and get inspired by others.',
    'Tips, Prompts & Workflows': 'Discover tips, prompts, and creative workflows.',
    'Ask the Community': 'Get help and advice from fellow StudioSix users.',
    'Bug Reports & Tech Help': 'Report bugs and get technical support.',
    'Feature Suggestions': 'Suggest new features and track progress.',
  };

  // Mock pending message counts for sub-channels
  // const subChannelCounts: Record<string, number> = {
  //   'Product Updates': 2,
  //   'Release Notes': 0,
  //   'Event Alerts': 1,
  //   'Interior': 3,
  //   'Exterior': 0,
  //   'Landscape': 5,
  //   'Floor Plan': 0,
  //   'Prompt Library': 4,
  //   'Workflow Ideas': 1,
  //   'StudioSix Hacks': 0,
  //   'General Questions': 6,
  //   'Software Setup': 0,
  //   'Hardware Support': 2,
  //   'Report a Bug': 1,
  //   'Known Issues': 0,
  //   'Troubleshooting Tips': 2,
  //   'Suggest a Feature': 3,
  //   'In Progress': 0,
  //   'Under Review': 1,
  // };

  // Handle authentication and data fetching
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in');
      return;
    }

    if (status === 'authenticated') {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);

          switch (activeTab) {
            case 'Your Images':
              const userPostsResponse = await fetch('/api/posts/user');
              if (!userPostsResponse.ok) {
                throw new Error('Failed to fetch user posts');
              }
              const userPostsData = await userPostsResponse.json();
              setUserPosts(userPostsData.posts.map((post: any) => ({
                ...post,
                author: {
                  name: session.user?.name || 'Anonymous',
                  image: session.user?.image || '/default-avatar.png'
                }
              })));
              break;

            case 'Liked Feed':
              const likedPostsResponse = await fetch('/api/posts/liked');
              if (!likedPostsResponse.ok) {
                throw new Error('Failed to fetch liked posts');
              }
              const likedPostsData = await likedPostsResponse.json();
              setLikedPosts(likedPostsData.posts.map((post: any) => ({
                ...post,
                author: {
                  name: post.user?.name || 'Anonymous',
                  image: post.user?.image || '/default-avatar.png'
                }
              })));
              break;

            case 'Your Feed':
              const postsResponse = await fetch('/api/posts');
              if (!postsResponse.ok) {
                throw new Error('Failed to fetch posts');
              }
              const postsData = await postsResponse.json();
              setPosts(postsData.posts.map((post: any) => ({
                ...post,
                author: {
                  name: post.user?.name || 'Anonymous',
                  image: post.user?.image || '/default-avatar.png'
                }
              })));
              break;

            case 'Collections':
              const collectionsResponse = await fetch('/api/collections');
              if (!collectionsResponse.ok) {
                throw new Error('Failed to fetch collections');
              }
              const collectionsData = await collectionsResponse.json();
              setCollections(collectionsData.collections.map((collection: any) => ({
                ...collection,
                posts: collection.posts.map((post: any) => ({
                  ...post,
                  author: {
                    name: post.user?.name || 'Anonymous',
                    image: post.user?.image || '/default-avatar.png'
                  }
                }))
              })));
              break;

            default:
              break;
          }
        } catch (err) {
          console.error('Error fetching data:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
          toast.error(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

      fetchData();
    }
  }, [status, router, activeTab, session]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [selectedImage]);

  // Fetch recommended profiles
  useEffect(() => {
    const fetchRecommendedProfiles = async () => {
      if (status !== 'authenticated') return;

      try {
        const response = await fetch('/api/recommended-profiles');
        if (!response.ok) {
          throw new Error('Failed to fetch recommended profiles');
        }

        const data = await response.json();
        setRecommendedProfiles(data.profiles);
      } catch (error) {
        console.error('Error fetching recommended profiles:', error);
      }
    };

    fetchRecommendedProfiles();
  }, [status]);

  // Fetch post collections
  useEffect(() => {
    const fetchPostCollections = async () => {
      if (status !== 'authenticated') return;

      try {
        const response = await fetch('/api/posts/collections');
        if (!response.ok) {
          throw new Error('Failed to fetch post collections');
        }
        const data = await response.json();
        setPostCollections(data.postCollections);
      } catch (error) {
        console.error('Error fetching post collections:', error);
      }
    };

    fetchPostCollections();
  }, [status]);

  // Update the initial categories in useEffect
  useEffect(() => {
    if (status === 'authenticated' && activeTab === 'Community') {
      const fetchCommunityData = async () => {
        try {
          setLoading(true);
          
          // Fetch categories from the API
          const response = await fetch('/api/community/categories');
          if (!response.ok) {
            throw new Error('Failed to fetch community categories');
          }
          
          const data = await response.json();
          if (data.categories && Array.isArray(data.categories)) {
            setCommunityCategories(data.categories);
            
            // If there's a selected forum, find its category and update the states
            if (selectedThread) {
              const category = data.categories.find((cat: CommunityCategory) => 
                cat.threads.some((thread: CommunityCategory['threads'][0]) => thread.id === selectedThread.id)
              );
              if (category) {
                setSelectedCategory(category.id);
                setSelectedCategoryData(category);
                fetchThreadMessages(selectedThread.id);
              }
            }
          } else {
            setCommunityCategories([]);
          }
        } catch (err) {
          console.error('Error fetching community data:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch community data');
          setCommunityCategories([]);
        } finally {
          setLoading(false);
        }
      };

      fetchCommunityData();
    }
  }, [status, activeTab, selectedThread]);

  // Update selectedCategoryData when selectedCategory changes
  useEffect(() => {
    const category = communityCategories.find(cat => cat.id === selectedCategory);
    setSelectedCategoryData(category || null);
  }, [selectedCategory, communityCategories]);

  // Show loading spinner while checking authentication
  if (status === 'loading' || !session) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const handleLike = async (postId: string) => {
    if (!session?.user) {
      alert('Please sign in to like posts');
      return;
    }

    try {
      console.log('Attempting to like post:', postId);
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to like post');
      }

      const { liked } = await response.json();
      console.log('Like response:', { postId, liked });

      // Update the post's like state and count
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                isLiked: liked,
                likesCount: liked ? post.likesCount + 1 : post.likesCount - 1,
              }
            : post
        )
      );
      } catch (error) {
      console.error('Error liking post:', error);
      alert(error instanceof Error ? error.message : 'Failed to like post. Please try again.');
      }
    };

  // Close modal when clicking outside or pressing escape
  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // Update the tabs array
  const tabs = [
    { 
      name: 'Community', 
      icon: 'edit', 
      iconWhite: 'edit-white', 
      regularIconSize: 16,
      activeIconSize: 20
    },
    { name: 'Your Images', icon: 'gallery', iconWhite: 'gallery-white', iconSize: 18 },
    { 
      name: 'Your Feed', 
      icon: 'heart', 
      iconWhite: 'heart-white',
      regularIconSize: 20,
      activeIconSize: 16
    },
    { name: 'Liked Feed', icon: 'like', iconWhite: 'like-white', iconSize: 18 },
    { name: 'Collections', icon: 'frame', iconWhite: 'frame-white', iconSize: 18 }
  ];

  // Sample feed data
  const feedPosts = [
    {
      id: 1,
      author: {
        name: 'James Smith',
        avatar: getRandomProfileIcon(),
        level: 2,
        levelTitle: 'Designer',
        isOnline: true
      },
      content: 'Just finished this modern villa render using the new lighting presets. The morning sun really brings out the texture of the wooden panels. What do you think about the shadow play?',
      image: '/gallery/image1.jpg',
      timeAgo: '12h ago',
      likes: 234,
      comments: 45
    },
    {
      id: 2,
      author: {
        name: 'Sarah Chen',
        avatar: getRandomProfileIcon(),
        level: 4,
        levelTitle: 'Designer',
        isOnline: false
      },
      content: 'Experimenting with Studio Six\'s new water reflection engine. The way it handles the pool area and glass facades is incredible. Swipe for before/after comparison.',
      image: '/gallery/image2.jpg',
      timeAgo: '1d ago',
      likes: 189,
      comments: 32
    },
    {
      id: 3,
      author: {
        name: 'Marcus Rodriguez',
        avatar: getRandomProfileIcon(),
        level: 3,
        levelTitle: 'Designer',
        isOnline: true
      },
      content: 'Quick tip: Use the new material presets in the latest update for ultra-realistic concrete textures. Here\'s a brutalist design I created using the new workflow.',
      image: '/gallery/image3.jpg',
      timeAgo: '2d ago',
      likes: 156,
      comments: 28
    },
    {
      id: 4,
      author: {
        name: 'Emma Watson',
        avatar: getRandomProfileIcon(),
        level: 5,
        levelTitle: 'Designer',
        isOnline: false
      },
      content: 'Love how the new vegetation system handles large-scale landscapes. Created this tropical villa scene in half the time it usually takes. The palm trees and grass movement look so natural!',
      image: '/gallery/image4.jpg',
      timeAgo: '3d ago',
      likes: 312,
      comments: 67
    }
  ];

  const toggleFollow = async (profileId: string) => {
    if (!session?.user) {
      alert('Please sign in to follow users');
      return;
    }

    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials in the request
        body: JSON.stringify({ targetUserId: profileId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to follow user');
      }

        const data = await response.json();
        setFollowingStates(prev => ({
          ...prev,
          [profileId]: data.followed
        }));
        
        // Refresh recommended profiles
      const profilesResponse = await fetch('/api/recommended-profiles', {
        credentials: 'include', // Include credentials in the request
      });
      
      if (!profilesResponse.ok) {
        throw new Error('Failed to fetch recommended profiles');
      }

          const profilesData = await profilesResponse.json();
          setRecommendedProfiles(profilesData.profiles);
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert(error instanceof Error ? error.message : 'Failed to follow user. Please try again.');
    }
  };

  const toggleComments = async (postId: string) => {
    try {
      if (!showComments[postId]) {
        await fetchComments(postId);
      }
      setShowComments(prev => ({
        ...prev,
        [postId]: !prev[postId],
      }));
    } catch (error) {
      console.error('Error toggling comments:', error);
      setError(error instanceof Error ? error.message : 'Failed to toggle comments');
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      console.log('Fetching comments for post:', postId);
      const response = await fetch(`/api/posts/${postId}/comments`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch comments');
      }

      const data = await response.json();
      console.log('Fetched comments:', data.comments);

      if (!Array.isArray(data.comments)) {
        throw new Error('Invalid comments data received');
      }

      // Transform comments to include default user image if none is provided
      const transformedComments = data.comments.map((comment: Comment) => ({
        ...comment,
        user: {
          ...comment.user,
          image: comment.user?.image || getRandomProfileIcon(),
        },
      }));

      setComments(prev => ({
        ...prev,
        [postId]: transformedComments,
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch comments');
    }
  };

  const handleComment = async (postId: string) => {
    try {
      const commentContent = newComment[postId]?.trim();
      if (!commentContent) {
        alert('Please enter a comment');
        return;
      }

      console.log('Creating comment for post:', postId);
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create comment');
      }

        const data = await response.json();
      console.log('Comment created:', data);

      if (!data.comment || !data.comment.user) {
        throw new Error('Invalid comment data received');
      }

      // Transform the new comment to include default user image
      const transformedComment = {
        ...data.comment,
        user: {
          ...data.comment.user,
          image: data.comment.user.image || getRandomProfileIcon(),
        },
      };

      // Update the comments state
      setComments(prev => ({
          ...prev,
        [postId]: [transformedComment, ...(prev[postId] || [])],
      }));

      // Update the post's comments count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, commentsCount: post.commentsCount + 1 }
          : post
      ));

      // Clear the comment input
      setNewComment(prev => ({
          ...prev,
        [postId]: '',
      }));

      // Show the comments section
      setShowComments(prev => ({
        ...prev,
        [postId]: true,
      }));
    } catch (error) {
      console.error('Error creating comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to create comment');
    }
  };

  // File handling functions
  const handleFileSelect = (type: 'image' | 'video' | 'document') => {
    if (!fileInputRef.current) return;

    // Reset the file input value to ensure the change event fires even if the same file is selected
    fileInputRef.current.value = '';

    // Set the accept attribute based on file type
    switch (type) {
      case 'image':
        fileInputRef.current.accept = '.jpg,.jpeg,.png,.gif,.webp';
        break;
      case 'video':
        fileInputRef.current.accept = '.mp4,.webm,.mov';
        break;
      case 'document':
        fileInputRef.current.accept = '.pdf,.doc,.docx,.txt';
        break;
    }

    // Trigger the file input click
    fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clean up any existing preview URL
    if (selectedFile?.preview) {
      URL.revokeObjectURL(selectedFile.preview);
    }

    // Determine file type
    const fileType = file.type.startsWith('image/') ? 'image' :
                    file.type.startsWith('video/') ? 'video' : 'document';

    // Create preview URL for images and videos
    let preview = '';
    if (fileType === 'image' || fileType === 'video') {
      try {
      preview = URL.createObjectURL(file);
        console.log('Created preview URL:', preview); // Debug log
      } catch (error) {
        console.error('Error creating preview URL:', error);
      }
    }

    // Create new selected file object
    const newSelectedFile: SelectedFile = {
      file,
      type: fileType,
      preview
    };

    console.log('Setting new selected file:', newSelectedFile); // Debug log
    setSelectedFile(newSelectedFile);
    
    // If we're in the forum context, automatically start the upload
    if (activeTab === 'Community' && selectedThread) {
      await handleForumUpload(newSelectedFile);
    }
  };

  const handleForumUpload = async (file: SelectedFile) => {
    if (!selectedThread) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate file type
      const fileType = file.file.type.split('/')[0];
      if (!['image', 'video', 'application'].includes(fileType)) {
        throw new Error('Invalid file type. Please upload an image, video, or document.');
      }

      // Validate file size (max 50MB)
      if (file.file.size > 50 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 50MB.');
      }

      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('type', file.type);
      formData.append('threadId', selectedThread.id);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/community/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Upload failed with status ${response.status}` }));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      setUploadProgress(100);
      
      // Update the new post content with the uploaded file URL
      setNewPost(prev => ({
        ...prev,
        content: prev.content + `\n![Uploaded file](${data.fileUrl})`,
      }));

      // Clear the selected file
      setSelectedFile(null);
      setUploadProgress(0);
      toast.success('File uploaded successfully!');

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error instanceof Error ? error.message : 'Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate file type
      const fileType = selectedFile.file.type.split('/')[0];
      if (!['image', 'video', 'application'].includes(fileType)) {
        throw new Error('Invalid file type. Please upload an image, video, or document.');
      }

      // Validate file size (max 50MB)
      if (selectedFile.file.size > 50 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 50MB.');
      }

      const formData = new FormData();
      formData.append('file', selectedFile.file);
      formData.append('type', selectedFile.type);
      
      // Get the caption from the textarea
      const caption = (document.querySelector('textarea[placeholder*="Share your"]') as HTMLTextAreaElement)?.value || '';
      formData.append('caption', caption);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // Add signal to allow for timeout/cancellation
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Upload failed with status ${response.status}` }));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload successful:', data);

      // Create new post object with proper author information
      const newPost: Post = {
        id: data.post.id,
        type: data.post.type,
        imageUrl: data.post.imageUrl,
        caption: data.post.caption,
        createdAt: data.post.createdAt,
        updatedAt: data.post.updatedAt || new Date().toISOString(),
        author: {
          name: session?.user?.name || 'Anonymous',
          image: session?.user?.image || '/default-avatar.png'
        },
        isLiked: false,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0
      };

      // Add the new post to both the main feed and user posts
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setUserPosts(prevPosts => [newPost, ...prevPosts]);

      // Clear the form
      setSelectedFile(null);
      setUploadProgress(0);
      if (document.querySelector('textarea[placeholder*="Share your"]')) {
        (document.querySelector('textarea[placeholder*="Share your"]') as HTMLTextAreaElement).value = '';
      }

      // Show success message
      toast.success('Post uploaded successfully!');

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error instanceof Error ? error.message : 'Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Add this function to handle share button click
  const handleShare = (post: Post) => {
    setSelectedPost(post);
    setShareModalOpen(true);
  };

  const handleShareSuccess = () => {
    // Update the local state instead of fetching all posts
    if (selectedPost) {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === selectedPost.id
            ? { ...post, sharesCount: (post.sharesCount || 0) + 1 }
            : post
        )
      );
    }
  };

  // Update the post card container styling
  const renderPosts = () => {
    if (loading) {
      return <div className="text-center py-4">Loading...</div>;
    }

    if (error) {
      return <div className="text-center py-4 text-red-500">{error}</div>;
    }

    let postsToRender: Post[] = [];
    let emptyMessage = '';

    switch (activeTab) {
      case 'Your Images':
        postsToRender = userPosts;
        emptyMessage = 'You haven\'t posted anything yet';
        break;
      case 'Liked Feed':
        postsToRender = likedPosts;
        emptyMessage = 'You haven\'t liked any posts yet';
        break;
      case 'Your Feed':
        postsToRender = posts;
        emptyMessage = 'No posts yet';
        break;
      case 'Collections':
        return renderCollections();
      default:
        return null;
    }

    if (postsToRender.length === 0) {
      return <div className="text-center py-4 text-gray-500">{emptyMessage}</div>;
    }

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {postsToRender.map((post) => (
          <div key={post.id} className="bg-white rounded-xl border border-[#E0DAF3] p-6">
            {/* Post Header */}
      <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden">
          <Image
                  src={post.author?.image || '/default-avatar.png'}
            alt={post.author?.name || 'Anonymous'}
                  width={48}
                  height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
                <h3 className="font-semibold text-lg">{post.author?.name || 'Anonymous'}</h3>
          <p className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

            {/* Post Content */}
            <div className="mb-4">
              {post.caption && (
                <p className="text-gray-700 mb-4">{post.caption}</p>
              )}
              {post.imageUrl && (
                <div className="relative w-full aspect-square max-h-[600px] rounded-lg overflow-hidden">
          <Image
            src={post.imageUrl}
            alt={post.caption || 'Post image'}
                    fill
                    className="object-cover"
                  />
                </div>
        )}
      </div>

            {/* Post Actions */}
            <div className="flex items-center space-x-4 border-t pt-4">
        <button
          onClick={() => handleLike(post.id)}
          className={`flex items-center space-x-1 ${
            post.isLiked ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          <Icon name="heart" className="w-5 h-5" />
          <span>{post.likesCount || 0}</span>
        </button>
        <button
          onClick={() => toggleComments(post.id)}
          className="flex items-center space-x-1 text-gray-500"
        >
          <Icon name="comment" className="w-5 h-5" />
          <span>{post.commentsCount || 0}</span>
        </button>
              {(activeTab === 'Your Images' || activeTab === 'Your Feed' || activeTab === 'Liked Feed') && (
                <div className="flex items-center space-x-2">
        <button 
          onClick={() => handleShare(post)}
          className="flex items-center space-x-1 text-gray-500"
        >
          <Icon name="share" className="w-5 h-5" />
          <span>{post.sharesCount || 0}</span>
        </button>
                  <div className="relative group">
            <button
                      onClick={() => setSelectedPost(post)}
                      className={`flex items-center space-x-1 ${
                        postCollections[post.id]?.length > 0 ? 'text-purple-600' : 'text-gray-500'
                      } hover:text-purple-600`}
                    >
                      <Icon name="frame" className="w-5 h-5" />
                      {postCollections[post.id]?.length > 0 && (
                        <span className="text-xs text-purple-600">
                          {postCollections[post.id].length}
                        </span>
                      )}
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg p-2 hidden group-hover:block z-10">
                      <p className="text-sm font-medium mb-2">Add to Collection</p>
                      <div className="space-y-1">
                        {collections.map(collection => {
                          const isInThisCollection = postCollections[post.id]?.includes(collection.id);
                          return (
                            <button
                              key={collection.id}
                              onClick={() => handleAddToCollection(post.id, collection.id)}
                              className={`block w-full text-left px-2 py-1 text-sm rounded ${
                                isInThisCollection 
                                  ? 'bg-purple-50 text-purple-600' 
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              {collection.name}
                              {isInThisCollection && (
                                <span className="ml-2 text-xs">✓</span>
                              )}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setShowCreateCollectionModal(true)}
                          className="block w-full text-left px-2 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded"
                        >
                          + Create New Collection
            </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>

            {/* Comments Section */}
            {showComments[post.id] && (
              <div className="mt-4 border-t pt-4">
                <div className="space-y-4">
            {comments[post.id]?.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image
                          src={comment.user?.image || '/default-avatar.png'}
                    alt={comment.user?.name || 'Anonymous'}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg px-4 py-2">
                    <p className="font-medium text-sm">{comment.user?.name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
                <div className="mt-4 flex space-x-2">
                  <input
                    type="text"
                    value={newComment[post.id] || ''}
                    onChange={(e) =>
                      setNewComment(prev => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))
                    }
                    placeholder="Add a comment..."
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => handleComment(post.id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Post
                  </button>
          </div>
        </div>
      )}
          </div>
        ))}
    </div>
  );
  };

  // Add collection creation handler
  const handleCreateCollection = async () => {
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCollection),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create collection');
      }

      const data = await response.json();
      setCollections(prev => [...prev, { ...data.collection, posts: [] }]);
      setShowCreateCollectionModal(false);
      setNewCollection({ name: '', description: '' });
      toast.success('Collection created successfully!');
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create collection');
    }
  };

  // Add post to collection handler
  const handleAddToCollection = async (postId: string, collectionId: string) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add post to collection');
      }

      // Update the postCollections state
      setPostCollections(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), collectionId],
      }));

      toast.success('Post added to collection!');
    } catch (error) {
      console.error('Error adding post to collection:', error);
      toast.error('Failed to add post to collection');
    }
  };

  // Add collection rendering
  const renderCollections = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (collections.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You haven't created any collections yet</p>
          <button
            onClick={() => setShowCreateCollectionModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Create Collection
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Collections</h2>
          <button
            onClick={() => setShowCreateCollectionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <PlusIcon className="w-5 h-5" />
            Create Collection
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map(collection => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{collection.name}</h3>
              {collection.description && (
                <p className="text-gray-600 mb-4">{collection.description}</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {collection.posts.slice(0, 4).map(post => (
                  <div key={post.id} className="relative aspect-square">
                    <Image
                      src={post.imageUrl}
                      alt={post.caption || 'Post image'}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {collection.posts.length} posts
              </p>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  // Add collection modal
  const renderCreateCollectionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Create New Collection</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateCollection();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={newCollection.name}
              onChange={(e) =>
                setNewCollection({ ...newCollection, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              value={newCollection.description}
              onChange={(e) =>
                setNewCollection({ ...newCollection, description: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowCreateCollectionModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Add new handler for creating posts
  const handleCreatePost = async () => {
    if (!session?.user) {
      toast.error('Please sign in to create a message');
        return;
      }

    if (!selectedThread) {
      toast.error('Please select a thread first');
        return;
      }

    try {
      // Upload file if selected
      let fileUrl = null;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile.file);
        formData.append('type', 'forum');
        formData.append('threadId', selectedThread.id);

        const uploadResponse = await fetch('/api/community/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        const { fileUrl: uploadedFileUrl } = await uploadResponse.json();
        fileUrl = uploadedFileUrl;
      }

      // Create a new thread with the message
      const response = await fetch('/api/community/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPost.content.slice(0, 50) + (newPost.content.length > 50 ? '...' : ''), // Use first 50 chars of content as thread name
          initialMessage: newPost.content + (fileUrl ? `\n![Uploaded file](${fileUrl})` : ''),
          threadId: selectedThread.id, // Use the thread ID directly
          isPrivate: false
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create message');
      }

      const { thread } = await response.json();
      toast.success('Message sent successfully');
      setNewPost({ title: '', content: '', category: '', tags: [] });
      setSelectedFile(null);
      setUploadProgress(0);
      
      // Refresh threads list
      if (selectedThread) {
        fetchThreadMessages(selectedThread.id);
      }
    } catch (error) {
      console.error('Error creating message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create message');
    }
  };

  // Update render function for community content
  const renderCommunityContent = () => {
    const subChannels = secondarySidebarMap[activeChannel] || [];
    const messages = selectedSubChannel ? messagesByChannel[selectedSubChannel] || [] : [];
    return (
      <>
        <div className="flex h-[calc(100vh-180px)]">
          {/* Main Sidebar */}
          <div className="w-16 bg-white flex flex-col items-center py-4 space-y-2 border-r border-[#E0DAF3] shadow-sm">
            {channelSidebarItems.map((item) => (
              <div key={item.name} className="group relative flex flex-col items-center">
                <button
                  className={`w-12 h-12 flex items-center justify-center rounded-xl mb-2 focus:outline-none transition-all
                    ${activeChannel === item.name
                      ? 'bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white shadow-lg'
                      : 'bg-[#F6F8FA] text-[#6C7275] hover:bg-[#E0DAF3] hover:text-[#814ADA]'}
                  `}
                  onClick={() => { setActiveChannel(item.name); setSelectedSubChannel(null); }}
                  aria-label={item.name}
                >
                  {item.icon.startsWith('/icons/') ? (
                    <Image 
                      src={activeChannel === item.name ? item.activeIcon : item.icon} 
                      alt={item.name} 
                      width={28} 
                      height={28} 
                    />
                  ) : (
                    <Icon 
                      name={activeChannel === item.name ? item.activeIcon : item.icon} 
                      size={28} 
                    />
                  )}
                </button>
                <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-white text-[#202126] text-xs rounded shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none border border-[#E0DAF3]">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
          {/* Secondary Sidebar */}
          <div className="w-56 bg-white border-r border-[#E0DAF3] flex flex-col py-4 px-2 shadow-sm">
            {/* Title and description */}
            <div className="mb-4 px-2">
              <div className="text-lg font-bold text-[#202126] mb-1">{activeChannel}</div>
              <div className="text-xs text-[#6C7275] mb-2">{channelDescriptions[activeChannel]}</div>
              <div className="h-px bg-[#E0DAF3] my-2" />
            </div>
            {/* Sub-channels */}
            <div className="flex flex-col gap-1">
              {subChannels.map((sub) => (
                    <button
                  key={sub}
                  className={`w-full flex items-center justify-between text-left px-4 py-2 rounded-lg text-[#202126] hover:bg-[#F6F8FA] transition-colors font-medium relative ${selectedSubChannel === sub ? 'bg-[#F6F8FA] font-bold text-[#814ADA]' : ''}`}
                  onClick={() => setSelectedSubChannel(sub)}
                >
                  <span>{sub}</span>
                  {subChannelCounts[sub] > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white">
                      {subChannelCounts[sub]}
                    </span>
                  )}
                    </button>
                  ))}
                </div>
              </div>
          {/* Chat Canvas */}
          <div className="flex-1 bg-white flex flex-col">
            {selectedSubChannel ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-[#E0DAF3] flex items-center gap-2 bg-white">
                  <span className="text-xl font-bold text-[#814ADA]"># {selectedSubChannel}</span>
          </div>
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {renderMessages()}
                  </div>
                  {/* Message Input */}
                  <div className="px-6 py-4 border-t border-[#E0DAF3] bg-white relative">
                    {/* File preview before sending */}
                    {chatFile && (
                      <div className="mb-2 flex items-center gap-3 bg-[#F6F8FA] p-3 rounded-lg border border-[#E0DAF3]">
                        {chatFile.type.startsWith('image/') && chatFilePreview && (
                          <img src={chatFilePreview} alt="Preview" className="max-h-24 rounded" />
                        )}
                        {chatFile.type.startsWith('video/') && chatFilePreview && (
                          <video src={chatFilePreview} controls className="max-h-24 rounded" />
                        )}
                        {!chatFile.type.startsWith('image/') && !chatFile.type.startsWith('video/') && (
                          <div className="flex items-center gap-2">
                            <Icon name="file" size={20} />
                            <span className="text-sm">{chatFile.name}</span>
                          </div>
                        )}
                        <button onClick={handleRemoveChatFile} className="ml-2 text-[#814ADA] hover:text-red-500">
                          <Icon name="close" size={20} />
                        </button>
                            </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          className="p-2 rounded-lg hover:bg-[#F6F8FA] text-[#814ADA]"
                          onClick={() => setShowAttachMenu((v) => !v)}
                          type="button"
                        >
                          <Icon name="plus" size={20} />
                        </button>
                        {showAttachMenu && (
                          <div className="absolute left-0 bottom-12 w-40 bg-white border border-[#E0DAF3] rounded-lg shadow-lg z-20">
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#F6F8FA] text-[#202126]"
                              onClick={() => openFilePicker('image')}
                              type="button"
                            >
                              <Icon name="image" size={18} /> Add Image
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#F6F8FA] text-[#202126]"
                              onClick={() => openFilePicker('video')}
                              type="button"
                            >
                              <Icon name="video" size={18} /> Add Video
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#F6F8FA] text-[#202126]"
                              onClick={() => openFilePicker('document')}
                              type="button"
                            >
                              <Icon name="file" size={18} /> Add Document
                            </button>
                                  </div>
                          )}
                        </div>
                    {/* Emoji picker button */}
                    <div className="relative">
                      <button
                        className="p-2 rounded-lg hover:bg-[#F6F8FA] text-[#814ADA]"
                        onClick={() => setShowEmojiPicker((v) => !v)}
                        type="button"
                      >
                        <Icon name="emoji" size={20} />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute left-0 bottom-12 w-64 bg-white border border-[#E0DAF3] rounded-lg shadow-lg z-20 p-2 flex flex-wrap gap-2">
                          {emojiList.map((emoji) => (
                            <button
                              key={emoji}
                              className="text-2xl p-1 hover:bg-[#F6F8FA] rounded"
                              onClick={() => handleEmojiSelect(emoji)}
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                      </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={chatFileInputRef}
                      className="hidden"
                      accept={chatFileAccept}
                      onChange={handleChatFileChange}
                    />
                    <input
                      type="text"
                      placeholder={`Message #${selectedSubChannel}`}
                      className="flex-1 p-3 rounded-lg border border-[#E0DAF3] focus:outline-none focus:ring-2 focus:ring-[#814ADA] bg-[#F6F8FA] text-[#202126]"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                    />
                    <button
                      className="p-2 rounded-lg bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white hover:opacity-90 transition-all"
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() && !chatFile}
                    >
                      <Icon name="paper-plane-tilt" size={20} />
                    </button>
                </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#6C7275]">
                <div className="text-2xl font-bold mb-2">Select a channel to start chatting</div>
                <div className="text-sm">Choose a topic from the sidebar to view or join the discussion.</div>
              </div>
            )}
          </div>
        </div>
        <div className="relative h-full">
          {/* Floating + button and menu */}
          <div className="fixed bottom-8 left-8 z-40">
            <button
              className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white shadow-lg hover:scale-105 transition-transform text-3xl"
              onClick={() => setShowFloatingMenu((v) => !v)}
              aria-label="Open actions menu"
            >
              +
            </button>
            {showFloatingMenu && (
              <div className="mt-3 bg-[#23272A] rounded-xl shadow-2xl py-2 w-60 flex flex-col gap-1 animate-fade-in border border-[#393C41]">
                <button className="flex items-center gap-3 px-5 py-3 text-white hover:bg-[#2C2F33] rounded-lg transition-colors text-base">
                  <img src="/icons/upload.svg" alt="Upload" className="w-5 h-5" />
                  <span>Upload a File</span>
                </button>
                <button
                  className="flex items-center gap-3 px-5 py-3 text-white hover:bg-[#2C2F33] rounded-lg transition-colors text-base"
                  onClick={() => { setShowCreateThreadModal(true); setShowFloatingMenu(false); }}
                >
                  <img src="/icons/chat-teardrop-text.svg" alt="Create Thread" className="w-5 h-5" />
                  <span>Create Thread</span>
                </button>
                <button
                  className="flex items-center gap-3 px-5 py-3 text-white hover:bg-[#2C2F33] rounded-lg transition-colors text-base"
                  onClick={() => { setShowCreatePollModal(true); setShowFloatingMenu(false); }}
                >
                  <img src="/icons/chart-bar-horizontal.svg" alt="Create Poll" className="w-5 h-5" />
                  <span>Create Poll</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  // Add handlers for thread and poll creation
  const handleCreateThread = async () => {
    try {
      if (!session?.user) {
        toast.error('Please sign in to create a message');
        return;
      }

      if (!selectedThread) {
        toast.error('Please select a thread first');
        return;
      }

      if (!newThread.initialMessage?.trim()) {
        toast.error('Please enter a message');
        return;
      }

      const response = await fetch(`/api/community/threads/${selectedThread.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newThread.initialMessage.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create message');
      }

      toast.success('Message sent successfully');
      setShowThreadModal(false);
      setNewThread({ name: '', initialMessage: '', isPrivate: false });
      
      // Refresh messages list
      fetchThreadMessages(selectedThread.id);
    } catch (error) {
      console.error('Error creating message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create message');
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error('Please sign in to create a poll');
      return;
    }

    if (!selectedThread) {
      toast.error('Please select a thread first');
      return;
    }

    try {
      // Filter out empty answers
      const validAnswers = newPoll.answers.filter(answer => answer.trim() !== '');
      
      if (validAnswers.length < 2) {
        toast.error('Please provide at least two answers');
        return;
      }

      const response = await fetch('/api/community/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: newPoll.question,
          answers: validAnswers,
          duration: newPoll.duration,
          allowMultipleAnswers: newPoll.allowMultipleAnswers,
          threadId: selectedThread.id // Use the thread ID directly
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create poll');
      }

      setShowPollModal(false);
      setNewPoll({
        question: '',
        answers: ['', ''],
        duration: 24,
        allowMultipleAnswers: false
      });
      toast.success('Poll created successfully!');
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create poll');
    }
  };

  // Update the message input section to show upload progress
  const renderMessageInput = () => (
              <div className="px-4 py-4 border-t border-[#E0DAF3]">
                <div className="bg-[#F6F8FA] rounded-lg p-4">
        {/* Add hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.pdf,.doc,.docx,.txt"
        />
        
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-[#E0DAF3]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon 
                  name={selectedFile.type === 'image' ? 'image' : 
                        selectedFile.type === 'video' ? 'video' : 'document'} 
                  size={24} 
                  className="text-[#814ADA]" 
                />
                <div>
                  <p className="text-sm font-medium text-[#202126]">{selectedFile.file.name}</p>
                  <p className="text-xs text-[#6C7275]">
                    {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (selectedFile.preview) {
                    URL.revokeObjectURL(selectedFile.preview);
                  }
                  setSelectedFile(null);
                }}
                className="p-1 text-[#6C7275] hover:text-[#814ADA] rounded-lg hover:bg-[#F6F8FA]"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            
            {/* Preview for images and videos */}
            {selectedFile.type === 'image' && selectedFile.preview && (
              <div className="mt-3 relative max-w-md rounded-lg overflow-hidden border border-[#E0DAF3]">
                <img
                  src={selectedFile.preview}
                  alt="Preview"
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}
            {selectedFile.type === 'video' && selectedFile.preview && (
              <div className="mt-3">
                <video
                  src={selectedFile.preview}
                  controls
                  className="max-w-md rounded-lg border border-[#E0DAF3]"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-4">
            <div className="w-full bg-[#E0DAF3] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#814ADA] to-[#392CA0] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-[#6C7275] mt-1">Uploading... {uploadProgress}%</p>
          </div>
        )}

        <div className="flex items-center space-x-2">
                    <div className="relative">
                      <button 
                        className="text-[#6C7275] hover:text-[#814ADA]"
                        onClick={() => setShowUploadMenu(!showUploadMenu)}
                      >
                        <Icon name="plus" size={20} />
                      </button>
                      {showUploadMenu && (
                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg p-1 border border-[#E0DAF3]">
                          <button
                            onClick={() => {
                              handleFileSelect('image');
                              setShowUploadMenu(false);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm text-[#202126] hover:bg-[#F6F8FA] rounded-lg"
                          >
                            <Icon name="image" size={16} className="mr-2" />
                  Upload Image
                          </button>
                <button
                  onClick={() => {
                    handleFileSelect('video');
                    setShowUploadMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-[#202126] hover:bg-[#F6F8FA] rounded-lg"
                >
                  <Icon name="video" size={16} className="mr-2" />
                  Upload Video
                </button>
                <button
                  onClick={() => {
                    handleFileSelect('document');
                    setShowUploadMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-[#202126] hover:bg-[#F6F8FA] rounded-lg"
                >
                  <Icon name="file" size={16} className="mr-2" />
                  Upload Document
                </button>
                <div className="h-px bg-[#E0DAF3] my-1"></div>
                          <button
                            onClick={() => {
                              setShowThreadModal(true);
                              setShowUploadMenu(false);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm text-[#202126] hover:bg-[#F6F8FA] rounded-lg"
                          >
                  <Icon name="chat-teardrop-text" size={16} className="mr-2" />
                            Create Thread
                          </button>
                          <button
                            onClick={() => {
                              setShowPollModal(true);
                              setShowUploadMenu(false);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm text-[#202126] hover:bg-[#F6F8FA] rounded-lg"
                          >
                  <Icon name="chart-bar-horizontal" size={16} className="mr-2" />
                            Create Poll
                          </button>
                        </div>
                      )}
                    </div>
                    <button className="text-[#6C7275] hover:text-[#814ADA]">
                      <Icon name="gif" size={20} />
                    </button>
                    <button className="text-[#6C7275] hover:text-[#814ADA]">
                      <Icon name="emoji" size={20} />
                    </button>
          <div className="flex-1">
                    <input
                      type="text"
              placeholder={`Message #${selectedThread?.name}`}
              className="w-full bg-transparent border-none text-[#202126] placeholder-[#6C7275] focus:outline-none focus:ring-0"
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    />
          </div>
                    <button 
                      className={`text-[#6C7275] hover:text-[#814ADA] disabled:opacity-50 disabled:hover:text-[#6C7275]`}
            disabled={(!newPost.content.trim() && !selectedFile) || isUploading}
            onClick={handleCreatePost}
                    >
            <Icon name="paper-plane-tilt" size={20} />
                    </button>
                  </div>
        </div>
      </div>
    );

  const fetchThreadMessages = async (threadId: string) => {
    try {
      const response = await fetch(`/api/community/threads/${threadId}/messages`);
      const data = await response.json();
      if (response.ok) {
        setThreadMessages(data.messages);
      } else {
        throw new Error(data.error || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    }
  };

  const handleThreadSelect = (thread: CommunityCategory['threads'][0], category: CommunityCategory) => {
    setSelectedThread(thread);
    setSelectedCategoryData(category);
    fetchThreadMessages(thread.id);
  };

  // Update the forum list rendering
  const renderForumList = () => {
    if (!selectedCategoryData) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedCategoryData.threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => handleThreadSelect(thread, selectedCategoryData)}
            className={`p-4 rounded-lg border transition-all ${
              selectedThread?.id === thread.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
            }`}
          >
            <h3 className="font-semibold text-gray-900 dark:text-white">{thread.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{thread.description}</p>
          </button>
        ))}
      </div>
    );
  };

  // Add message to messagesByChannel
 

  const handleChatFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setChatFile(file);
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      setChatFilePreview(URL.createObjectURL(file));
    } else {
      setChatFilePreview(null);
    }
    setShowAttachMenu(false);
  };

  const handleRemoveChatFile = () => {
    if (chatFilePreview) URL.revokeObjectURL(chatFilePreview);
    setChatFile(null);
    setChatFilePreview(null);
  };

  const openFilePicker = (type: 'image' | 'video' | 'document') => {
    let accept = '';
    if (type === 'image') accept = '.jpg,.jpeg,.png,.gif,.webp';
    if (type === 'video') accept = '.mp4,.webm,.mov';
    if (type === 'document') accept = '.pdf,.doc,.docx,.txt';
    setChatFileAccept(accept);
    setShowAttachMenu(false);
    setTimeout(() => chatFileInputRef.current?.click(), 100);
  };

  // Emoji insert logic
  const handleEmojiSelect = (emoji: string) => {
    setChatInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Reaction logic
  const handleToggleReaction = (msgIdx: number, emoji: string) => {
    if (!selectedSubChannel) return;
    setMessagesByChannel((prev) => {
      const channelMsgs = [...(prev[selectedSubChannel] || [])];
      const msg = { ...channelMsgs[msgIdx] };
      if (!msg.reactions) msg.reactions = [];
      let reaction = msg.reactions.find((r) => r.emoji === emoji);
      if (!reaction) {
        // Add new reaction
        msg.reactions.push({ emoji, users: ['You'] });
      } else {
        // Toggle user
        if (reaction.users.includes('You')) {
          reaction.users = reaction.users.filter((u) => u !== 'You');
        } else {
          reaction.users.push('You');
        }
        // Remove reaction if no users left
        if (reaction.users.length === 0) {
          msg.reactions = msg.reactions.filter((r) => r.emoji !== emoji);
        }
      }
      channelMsgs[msgIdx] = msg;
      return { ...prev, [selectedSubChannel]: channelMsgs };
    });
  };

  // Update the messages display section
  const renderMessages = () => {
    if (loadingMessages) {
      return <div className="text-center text-[#6C7275] mt-10">Loading messages...</div>;
    }

    if (!messages || messages.length === 0) {
      return <div className="text-center text-[#6C7275] mt-10">No messages yet. Start the conversation!</div>;
    }

    return messages.map((msg) => (
      <div key={msg.id} className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#F6F8FA]">
          {msg.user?.image ? (
            <Image 
              src={msg.user.image} 
              alt={msg.user?.name || 'User'} 
              width={32} 
              height={32} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                // If image fails to load, replace with default avatar
                const target = e.target as HTMLImageElement;
                target.src = '/default-avatar.png';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#E0DAF3] text-[#814ADA]">
              <Icon name="user" size={16} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#202126]">{msg.user?.name || 'Anonymous'}</span>
            <span className="text-xs text-[#6C7275]">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <div className="text-[#202126] mt-1">{msg.content}</div>
          {msg.fileUrl && (
            <div className="mt-2">
              {msg.fileType?.startsWith('image/') && (
                <img src={msg.fileUrl} alt="Uploaded file" className="max-w-xs rounded-lg border border-[#E0DAF3]" />
              )}
              {msg.fileType?.startsWith('video/') && (
                <video src={msg.fileUrl} controls className="max-w-xs rounded-lg border border-[#E0DAF3]" />
              )}
              {msg.fileType && !msg.fileType.startsWith('image/') && !msg.fileType.startsWith('video/') && (
                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#814ADA] underline">
                  <Icon name="file" size={20} />
                  View File
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <DashboardLayout currentPage="Library">
      <style jsx global>{scrollbarStyles}</style>
      <div className="w-full h-[calc(100vh-4rem)] bg-[#F6F8FA] rounded-2xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Centered Tab Navigation */}
          <div className="flex justify-center px-8 py-2 bg-[#F6F8FA]">
            <div className="flex items-center p-1.5 gap-2.5 w-[870px] h-[52px] bg-white border border-[#CDD0D5] rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name as typeof activeTab)}
                  className={`flex justify-center items-center px-3 py-2.5 gap-1 flex-1 rounded-[10px] transition-all duration-200 ${
                    activeTab === tab.name
                      ? 'bg-gradient-to-r from-[#814ADA] to-[#392CA0]'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon
                    name={activeTab === tab.name ? tab.iconWhite : tab.icon}
                    size={
                      activeTab === tab.name ? tab.activeIconSize : tab.regularIconSize
                    }
                  />
                  <span
                    className={`font-roboto font-medium text-sm ${
                      activeTab === tab.name ? 'text-white' : 'text-[#202126]'
                    }`}
                  >
                    {tab.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex gap-5 p-6 h-[calc(100%-76px)] overflow-hidden">
            {/* Main Feed Column - Scrollable */}
            <div className={`${activeTab === 'Community' || activeTab === 'Collections' ? 'w-full' : 'flex-1'} overflow-y-auto custom-scrollbar pr-4`}>
              {(activeTab === 'Your Images' || activeTab === 'Your Feed' || activeTab === 'Liked Feed') && (
                <>
              {/* Create Post Card */}
              <div className="bg-white rounded-xl border border-[#E0DAF3] p-4 mb-6">
                <div className="text-lg font-medium text-[#202126] mb-4">Share your render</div>
                <div className="flex items-center gap-4 mb-4">
                  <textarea 
                    placeholder="Share your architectural renders, design techniques, or ask for feedback..."
                    className="w-full min-h-[100px] p-3 rounded-lg border border-[#E0DAF3] resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button 
                      onClick={() => handleFileSelect('image')}
                      className="flex items-center gap-2 text-[#202126] hover:text-purple-600 transition-colors"
                    >
                      <Icon name="image" size={20} />
                      <span>Image</span>
                    </button>
                    <button 
                      onClick={() => handleFileSelect('video')}
                      className="flex items-center gap-2 text-[#202126] hover:text-purple-600 transition-colors"
                    >
                      <Icon name="video" size={20} />
                      <span>Video</span>
                    </button>
                    <button 
                      onClick={() => handleFileSelect('document')}
                      className="flex items-center gap-2 text-[#202126] hover:text-purple-600 transition-colors"
                    >
                      <Icon name="file" size={20} />
                      <span>Document</span>
                    </button>
                  </div>
                  <button 
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className={`px-4 py-2 bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white rounded-lg transition-opacity ${
                      (!selectedFile || isUploading) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                  >
                    {isUploading ? `Uploading... ${uploadProgress}%` : 'Post'}
                  </button>
                </div>
              </div>

              {/* File Preview */}
              {selectedFile && (
                <div className="mt-4 relative">
                  {selectedFile.type === 'image' && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image
                        src={selectedFile.preview || ''}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  {selectedFile.type === 'video' && (
                    <video
                      src={selectedFile.preview}
                      controls
                      className="w-full max-h-48 rounded-lg"
                    />
                  )}
                  {selectedFile.type === 'document' && (
                    <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-lg">
                      <Icon name="file" size={24} />
                      <span className="text-sm truncate">{selectedFile.file.name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (selectedFile.preview) {
                        URL.revokeObjectURL(selectedFile.preview);
                      }
                      setSelectedFile(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
                  )}
                </>
              )}

              {/* New Activity Header */}
              {activeTab !== 'Community' && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-red-500 font-medium">New activity</span>
                <div className="h-[1px] flex-1 bg-[#E0DAF3]"></div>
              </div>
              )}

              {/* Feed Posts */}
              <div className="space-y-4">
                {activeTab === 'Community' ? renderCommunityContent() : renderPosts()}
              </div>
            </div>

            {/* Right Sidebar - Sticky */}
            {activeTab !== 'Community' && activeTab !== 'Collections' && (
            <div className="w-[380px] shrink-0 sticky top-6">
                {/* Recommended Profiles - Only show on Your Images, Your Feed, and Liked Feed tabs */}
                {(activeTab === 'Your Images' || activeTab === 'Your Feed' || activeTab === 'Liked Feed') && (
              <div className="bg-white rounded-xl border border-[#E0DAF3] p-4 mb-4">
                    <h3 className="text-lg font-medium text-[#202126] mb-4">Recommended Profiles</h3>
                <div className="space-y-4">
                      {recommendedProfiles.map((profile) => (
                      <div key={profile.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Image
                              src={profile.image || getRandomProfileIcon()}
                              alt={profile.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          <div>
                              <p className="font-medium text-gray-900">{profile.name}</p>
                              <p className="text-sm text-gray-500">{profile.role || 'Designer'}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleFollow(profile.id)}
                            className={`px-3 py-1 rounded-lg text-sm ${
                            followingStates[profile.id]
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-purple-600 text-white'
                          }`}
                        >
                            {followingStates[profile.id] ? 'Following' : 'Follow'}
                        </button>
                      </div>
                      ))}
                    </div>
                </div>
                )}

              {/* Remove the Events section */}
            </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 