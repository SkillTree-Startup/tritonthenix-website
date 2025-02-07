export interface UserData {
  email: string;
  name: string;
  isAdmin: boolean;
  profilePicture?: string;
  createdAt?: Date;
  lastLogin: Date;
}

declare global {
  interface Window {
    google: any;
  }
} 