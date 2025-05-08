import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
  reactions: any[];
  fileUrl?: string;
  fileType?: string;
}

interface ChatData {
  messages: Message[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    hasMore: boolean;
  };
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: any;
  sendMessage: (content: string, fileUrl?: string, fileType?: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isSending: boolean;
}

export function useChat(channelId: string): UseChatReturn {
  const { data: session } = useSession();
  const [isSending, setIsSending] = useState(false);

  console.log('useChat hook called with channelId:', channelId);

  const { data, error, isLoading, mutate: mutateMessages } = useSWR<ChatData>(
    channelId ? `/api/community/channels/${channelId}/messages` : null,
    async (url: string) => {
      console.log('Fetching messages from:', url);
      const res = await fetch(url);
      if (!res.ok) {
        console.error('Failed to fetch messages:', res.status, res.statusText);
        throw new Error('Failed to fetch messages');
      }
      const data = await res.json();
      console.log('Received messages:', data);
      return data;
    },
    {
      refreshInterval: 1000, // Poll every second for new messages
      revalidateOnFocus: true,
    }
  );

  useEffect(() => {
    console.log('useChat state updated:', {
      messages: data?.messages?.length || 0,
      isLoading,
      error,
      hasMore: data?.pagination?.hasMore,
    });
  }, [data, isLoading, error]);

  const messages = data?.messages || [];
  const hasMore = data?.pagination?.hasMore || false;

  const sendMessage = useCallback(
    async (content: string, fileUrl?: string, fileType?: string) => {
      if (!session?.user?.id || !channelId) {
        console.log('Cannot send message: No session or channelId');
        return;
      }

      setIsSending(true);
      try {
        console.log('Sending message:', { content, fileUrl, fileType });
        const res = await fetch(`/api/community/channels/${channelId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, fileUrl, fileType }),
        });

        if (!res.ok) {
          console.error('Failed to send message:', res.status, res.statusText);
          throw new Error('Failed to send message');
        }

        const newMessage = await res.json();
        console.log('Message sent successfully:', newMessage);
        
        // Update the messages list
        await mutateMessages(
          async (currentData) => {
            if (!currentData) {
              console.log('No current data, returning new message');
              return {
                messages: [newMessage],
                pagination: {
                  total: 1,
                  pages: 1,
                  currentPage: 1,
                  hasMore: false,
                },
              };
            }
            console.log('Updating messages list with new message');
            return {
              ...currentData,
              messages: [...currentData.messages, newMessage],
              pagination: {
                ...currentData.pagination,
                total: currentData.pagination.total + 1,
              },
            };
          },
          { revalidate: true }
        );
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      } finally {
        setIsSending(false);
      }
    },
    [channelId, session?.user?.id, mutateMessages]
  );

  const loadMore = useCallback(async () => {
    if (!data?.pagination?.currentPage) {
      console.log('Cannot load more: No current page');
      return;
    }

    const nextPage = data.pagination.currentPage + 1;
    console.log('Loading more messages, page:', nextPage);
    
    const res = await fetch(
      `/api/community/channels/${channelId}/messages?page=${nextPage}`
    );
    if (!res.ok) {
      console.error('Failed to load more messages:', res.status, res.statusText);
      throw new Error('Failed to load more messages');
    }

    const newData = await res.json();
    console.log('Loaded more messages:', newData);
    
    await mutateMessages(
      async (currentData) => {
        if (!currentData) {
          console.log('No current data, returning new data');
          return newData;
        }
        console.log('Updating messages list with more messages');
        return {
          ...currentData,
          messages: [...currentData.messages, ...newData.messages],
          pagination: newData.pagination,
        };
      },
      { revalidate: false }
    );
  }, [channelId, data?.pagination?.currentPage, mutateMessages]);

  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!session?.user?.id) {
        console.log('Cannot add reaction: No session');
        return;
      }

      try {
        console.log('Adding reaction:', { messageId, emoji });
        const res = await fetch('/api/community/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, emoji }),
        });

        if (!res.ok) {
          console.error('Failed to add reaction:', res.status, res.statusText);
          throw new Error('Failed to add reaction');
        }

        console.log('Reaction added successfully');
        // Revalidate messages to show the new reaction
        await mutateMessages();
      } catch (error) {
        console.error('Error adding reaction:', error);
        throw error;
      }
    },
    [session?.user?.id, mutateMessages]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    addReaction,
    loadMore,
    hasMore,
    isSending,
  };
} 