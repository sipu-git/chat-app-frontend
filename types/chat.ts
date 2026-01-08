export interface User {
  id: string;
  name: string;
  profilePic?: string;
  online?: boolean;
  lastSeen?:string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content?: string | null;
  mediaKey?:string | null;
  mediaType?:"image" | null;
  status?: "sent" | "delivered" | "seen";
  isRead?: boolean;
  createdAt: string;
}
