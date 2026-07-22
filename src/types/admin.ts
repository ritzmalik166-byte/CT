export type UserRole = "superadmin" | "admin";

export type BlogStatus = "draft" | "published" | "scheduled" | "inactive";

export type AssetType = "image" | "video" | "document" | "other";

export interface UserPermissions {
  can_manage_blogs: boolean;
  can_manage_assets: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithPermissions extends User {
  permissions: UserPermissions;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  blog_keywords: string | null;
  blog_meta_description: string | null;
  content: string;
  cover_image: string | null;
  author_name: string | null;
  author_id: number | null;
  status: BlogStatus;
  published_at: Date | null;
  scheduled_publish_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface BlogWithAuthor extends Blog {
  author_name: string | null;
  author_email: string | null;
}

export interface BlogFormPayload {
  title: string;
  slug: string;
  blog_keywords?: string;
  blog_meta_description?: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  author_name?: string;
  status: BlogStatus;
  scheduled_publish_at?: string | null;
}

export interface SiteAsset {
  id: number;
  asset_key: string;
  label: string;
  asset_url: string;
  asset_type: AssetType;
  description: string | null;
  updated_by: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export interface SessionUser extends UserWithPermissions {}

export type PermissionKey = keyof UserPermissions;

export interface DashboardStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  scheduledBlogs: number;
  inactiveBlogs: number;
  totalUsers: number;
  totalAssets: number;
}
