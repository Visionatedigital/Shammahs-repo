import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Icon } from '@/components/Icons';
import Link from 'next/link';
import Image from 'next/image';

interface Thread {
  id: string;
  name: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  messages: {
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
      image: string;
    };
  }[];
}

interface ThreadDisplayProps {
  threads: Thread[];
  onThreadClick?: (threadId: string) => void;
}

export function ThreadDisplay({ threads, onThreadClick }: ThreadDisplayProps) {
  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <div
          key={thread.id}
          onClick={() => onThreadClick?.(thread.id)}
          className="bg-neutral-900 rounded-lg p-4 border border-neutral-800 hover:border-purple-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                {thread.name}
              </h3>
              <p className="text-neutral-400 text-sm line-clamp-2">
                {thread.messages[0]?.content}
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <span className="text-neutral-500 text-sm">
                {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
              </span>
              <Icon name="chevron-right" size={20} className="text-neutral-500" />
            </div>
          </div>

          <div className="flex items-center mt-4 space-x-2">
            <div className="relative w-6 h-6 rounded-full overflow-hidden">
              <Image
                src={thread.author.image || '/default-avatar.png'}
                alt={thread.author.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-sm text-neutral-400">
              Started by {thread.author.name}
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-sm text-neutral-400">
              {thread.messages.length} {thread.messages.length === 1 ? 'message' : 'messages'}
            </span>
          </div>
        </div>
      ))}

      {threads.length === 0 && (
        <div className="text-center py-8">
          <Icon name="chat-teardrop-text" size={48} className="text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-400 mb-2">
            No threads yet
          </h3>
          <p className="text-neutral-500">
            Be the first to start a conversation in this forum
          </p>
        </div>
      )}
    </div>
  );
} 