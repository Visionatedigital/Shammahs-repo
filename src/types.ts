export interface Post {
    id: string;
    imageUrl: string;
    caption: string;
    type: 'image' | 'video' | 'document';
    createdAt: string;
    updatedAt: string;
    likesCount: number;
    sharesCount: number;
    commentsCount: number;
    isLiked: boolean;
    author: {
      name: string;
      image: string;
    };
  } 