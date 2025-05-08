import { Post } from '@/types';
import Image from 'next/image';
import { Icon } from '@/components/Icons';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (post: Post) => void;
}

export function PostCard({ post, onLike, onComment, onShare }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      const data = await response.json();
      setIsLiked(data.liked);
      setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
      onLike?.(post.id);
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleComment = () => {
    onComment?.(post.id);
  };

  const handleShare = () => {
    onShare?.(post);
  };

  return (
    <div className="bg-white rounded-xl border border-[#E0DAF3] p-4 mb-6">
      {/* Author Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={post.author.image}
            alt={post.author.name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="font-medium text-[#202126]">{post.author.name}</div>
          <div className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        {post.type === 'image' && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={post.caption || 'Post image'}
              fill
              className="object-cover"
            />
          </div>
        )}
        {post.type === 'video' && (
          <video
            src={post.imageUrl}
            controls
            className="w-full rounded-lg"
          />
        )}
        {post.type === 'document' && (
          <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-lg">
            <Icon name="file" size={24} />
            <span className="text-sm truncate">{post.caption}</span>
          </div>
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="text-gray-700 mb-4">{post.caption}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 ${
            isLiked ? 'text-purple-600' : 'text-gray-500'
          }`}
        >
          <Icon name="heart" size={20} />
          <span>{likesCount}</span>
        </button>
        <button
          onClick={handleComment}
          className="flex items-center gap-1.5 text-gray-500"
        >
          <Icon name="comment" size={20} />
          <span>{post.commentsCount}</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-gray-500"
        >
          <Icon name="share" size={20} />
          <span>{post.sharesCount}</span>
        </button>
      </div>
    </div>
  );
} 