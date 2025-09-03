export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export type Persona = 'GEMINI' | 'GPT' | 'DEEPSEEK' | 'CLAUDE' | 'HAMZAWY_CODE' | 'TEACHER';

export interface MessagePart {
  text?: string;
  image?: string; // base64 encoded image
  video?: string; // base64 encoded video
  videoMimeType?: string;
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface ChatMessage {
  id: string;
  role: Role;
  parts: MessagePart[];
  persona: Persona;
  groundingMetadata?: GroundingChunk[];
}

export type ChatHistory = ChatMessage[];

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  persona: Persona;
  messages: ChatHistory;
}

export type LoadingState = 'IDLE' | 'LOADING' | 'STREAMING';

export interface ImageFile {
  data: string; // base64 encoded
  mimeType: string;
}