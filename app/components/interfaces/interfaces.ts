export type PostCategory = "SocialMedia" | "AppUsage" | "Connections" | "Stats" | "Features" | "Other";
export type PostType = "feature" | "bug";
export type PostStatus = "requested" | "in-progress" | "complete";

export interface Post {
  id: string;
  title: string;
  description: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
  type: PostType;
  category: PostCategory;
  upvotes: number;
  upvotedBy: string[];
  status: PostStatus;
  userName?: string;
  userProfilePic?: string;
}

export interface BugReport extends Post {
  type: "bug";
  stepsToReproduce: string;
  deviceInfo: string;
}

export interface FeatureRequest extends Post {
  type: "feature";
}

export interface Vote {
  userId: string;
  postId: string;
  createdAt: any;
}

// Keep old FeatureRequest interface for backward compatibility with any existing code
export interface OldFeatureRequest {
  id: string;
  title: string;
  description: string;
  userId: string;
  createdAt: any;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
  status: "requested" | "in-progress" | "complete";
}

export interface OldVote {
  userId: string;
  type: "like" | "dislike";
}