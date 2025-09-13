export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export type DefaultPersonaId = 'GEMINI' | 'GPT' | 'DEEPSEEK' | 'CLAUDE' | 'HAMZAWY_CODE' | 'TEACHER';
export type PersonaId = DefaultPersonaId | string; // Allows for custom string IDs

export type PersonaIcon = 'gemini' | 'gpt' | 'deepseek' | 'claude' | 'code' | 'teacher' | 'robot' | 'book' | 'briefcase' | 'flask';

export interface PersonaDetails {
  id: PersonaId;
  name: string;
  themeClass?: string; // For default personas
  themeColor?: string; // For custom personas
  icon: PersonaIcon;
  systemInstruction: string;
  isCustom: boolean;
}

export interface MediaFile {
  data: string; // base64 encoded
  mimeType: string;
  name?: string;
}

export interface MessagePart {
  text?: string;
  media?: MediaFile;
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export type MessageStatus = 'SENT' | 'READ' | 'ERROR';

export interface ChatMessage {
  id: string;
  role: Role;
  parts: MessagePart[];
  personaId: PersonaId;
  groundingMetadata?: GroundingChunk[];
  timestamp: number;
  status?: MessageStatus;
}

export type ChatHistory = ChatMessage[];

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  personaId: PersonaId;
  messages: ChatHistory;
}

export type LoadingState = 'IDLE' | 'LOADING' | 'STREAMING';

export type NotificationType = {
  id: number;
  message: string;
};
