import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { format } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import { Upload, Smile, Send } from 'lucide-react';

interface ChatCanvasProps {
  channelId: string;
}

export default function ChatCanvas({ channelId }: ChatCanvasProps) {
  const { data: session } = useSession();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    addReaction,
    loadMore,
    hasMore,
    isSending,
  } = useChat(channelId);

  // Debug logging
  useEffect(() => {
    console.log('Current messages:', messages);
    console.log('Is loading:', isLoading);
    console.log('Error:', error);
  }, [messages, isLoading, error]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/community/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const { url, type } = await res.json();
      await sendMessage(`Uploaded ${file.name}`, url, type);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const renderFilePreview = (message: any) => {
    if (!message.fileUrl) return null;

    switch (message.fileType) {
      case 'image':
        return (
          <div className="mt-2">
            <Image
              src={message.fileUrl}
              alt="Uploaded image"
              width={300}
              height={200}
              className="rounded-lg"
            />
          </div>
        );
      case 'video':
        return (
          <div className="mt-2">
            <video
              src={message.fileUrl}
              controls
              className="rounded-lg max-w-md"
            />
          </div>
        );
      case 'document':
        return (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center text-blue-500 hover:text-blue-600"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            View Document
          </a>
        );
      default:
        return null;
    }
  };

  const renderReactions = (message: any) => {
    if (!message.reactions?.length) return null;

    const groupedReactions = message.reactions.reduce((acc: any, reaction: any) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
        };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.user);
      return acc;
    }, {});

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.values(groupedReactions).map((reaction: any) => (
          <button
            key={reaction.emoji}
            onClick={() => addReaction(message.id, reaction.emoji)}
            className="flex items-center px-2 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200"
          >
            <span className="mr-1">{reaction.emoji}</span>
            <span className="text-gray-600">{reaction.count}</span>
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Error loading messages. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasMore && (
          <button
            onClick={loadMore}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Load more messages
          </button>
        )}
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.user.id === session?.user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.user.id === session?.user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Image
                    src={msg.user.image}
                    alt={msg.user.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="font-medium">{msg.user.name}</span>
                  <span className="text-xs opacity-70">
                    {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
                {renderFilePreview(msg)}
                {renderReactions(msg)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <Smile className="w-5 h-5" />
          </button>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 min-h-[40px] max-h-[120px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending}
            className="p-2 text-blue-500 hover:text-blue-600 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setMessage((prev) => prev + emojiData.emoji);
                setShowEmojiPicker(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
} 