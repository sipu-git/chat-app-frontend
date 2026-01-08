export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  isOnline: boolean;
  profilePic?: string;
  lastSeen?:string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  user: User;
}
