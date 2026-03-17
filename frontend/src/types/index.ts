export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface Server {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  channels: Channel[];
  _count?: { members: number };
}

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  type: "TEXT" | "ANNOUNCEMENT";
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  user: {
    id: string;
    username: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export interface ServerState {
  servers: Server[];
  activeServer: Server | null;
  isLoading: boolean;
  fetchServers: () => Promise<void>;
  setActiveServer: (server: Server) => void;
  addServer: (server: Server) => void;
  removeServer: (serverId: string) => void;
}

export interface ChannelState {
  channels: Channel[];
  activeChannel: Channel | null;
  isLoading: boolean;
  fetchChannels: (serverId: string) => Promise<void>;
  setActiveChannel: (channel: Channel) => void;
  addChannel: (channel: Channel) => void;
  removeChannel: (channelId: string) => void;
}

export interface MessageState {
  messages: Record<string, Message[]>; // keyed by channelId
  hasMore: Record<string, boolean>;
  isLoading: boolean;
  fetchMessages: (channelId: string, cursor?: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  removeMessage: (channelId: string, messageId: string) => void;
  clearChannel: (channelId: string) => void;
}
