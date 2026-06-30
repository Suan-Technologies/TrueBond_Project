import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RelationshipGoal = 'friendship' | 'dating' | 'serious' | 'engagement' | 'marriage';
export type verification_level = 'none' | 'phone' | 'email' | 'face' | 'id';
export type Gender = 'male' | 'female' | 'other';
export type PremiumPlan = 'free' | 'silver' | 'gold' | 'platinum';

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender?: string;
  photos?: string[];
  bio: string;
  location: string;
  distance?: string;
  profession: string;
  education: string;
  religion?: string;
  height: string;
  languages: string[];
  interests: string[];
  relationshipGoal?: RelationshipGoal;
  verification_level: verification_level;
  trust_score: number;
  is_online: boolean;
  last_active: string;
  title?: string;
  income?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'voice';
  isRead: boolean;
}

export interface Conversation {
  id: string;
  matchId: string;
  profile: Profile;
  messages: Message[];
  unreadCount: number;
  lastMessage?: Message;
}

export interface Match {
  id: string;
  profile: Profile;
  matchedAt: Date;
  isNew: boolean;
}

export interface UserState {
  isAuthenticated: boolean;
  currentUser: Profile | null;
  premiumPlan: PremiumPlan;
  dailyLikesRemaining: number;
  dailyChatsRemaining: number;
  boostCount: number;
}

interface AppState extends UserState {
  currentScreen: string;
  selectedProfileId: string | null;
  selectedConversationId: string | null;
  showMatchOverlay: boolean;
  matchedProfile: Profile | null;
  filterVerifiedOnly: boolean;
  filterAgeRange: [number, number];
  filterDistance: number;
  filterGoals: RelationshipGoal[];

  setCurrentScreen: (screen: string) => void;
  setSelectedProfileId: (id: string | null) => void;
  setSelectedConversationId: (id: string | null) => void;
  setShowMatchOverlay: (show: boolean) => void;
  setMatchedProfile: (profile: Profile | null) => void;
  setAuthenticated: (val: boolean) => void;
  setCurrentUser: (user: Profile | null) => void;
  setPremiumPlan: (plan: PremiumPlan) => void;
  setFilterVerifiedOnly: (val: boolean) => void;
  setFilterAgeRange: (range: [number, number]) => void;
  setFilterDistance: (dist: number) => void;
  setFilterGoals: (goals: RelationshipGoal[]) => void;
  decrementLikes: () => void;
  decrementChats: () => void;
  hydrateFromStorage: () => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentUser: null,
      premiumPlan: 'free',
      dailyLikesRemaining: 10,
      dailyChatsRemaining: 5,
      boostCount: 0,
      currentScreen: 'landing',
      selectedProfileId: null,
      selectedConversationId: null,
      showMatchOverlay: false,
      matchedProfile: null,
      filterVerifiedOnly: false,
      filterAgeRange: [21, 35],
      filterDistance: 50,
      filterGoals: [],

      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      setSelectedProfileId: (id) => set({ selectedProfileId: id }),
      setSelectedConversationId: (id) => set({ selectedConversationId: id }),
      setShowMatchOverlay: (show) => set({ showMatchOverlay: show }),
      setMatchedProfile: (profile) => set({ matchedProfile: profile }),
      setAuthenticated: (val) => set({ isAuthenticated: val }),
      setCurrentUser: (user) => set({ currentUser: user }),
      setPremiumPlan: (plan) => set({ premiumPlan: plan }),
      setFilterVerifiedOnly: (val) => set({ filterVerifiedOnly: val }),
      setFilterAgeRange: (range) => set({ filterAgeRange: range }),
      setFilterDistance: (dist) => set({ filterDistance: dist }),
      setFilterGoals: (goals) => set({ filterGoals: goals }),
      decrementLikes: () => set((s) => ({ dailyLikesRemaining: Math.max(0, s.dailyLikesRemaining - 1) })),
      decrementChats: () => set((s) => ({ dailyChatsRemaining: Math.max(0, s.dailyChatsRemaining - 1) })),
      hydrateFromStorage: () => {
        const token = localStorage.getItem('access_token');
        if (token) {
          set({ isAuthenticated: true });
        } else {
          set({ isAuthenticated: false, currentUser: null });
        }
      },
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ isAuthenticated: false, currentUser: null, premiumPlan: 'free', dailyLikesRemaining: 10, dailyChatsRemaining: 5, boostCount: 0 });
      },
    }),
    {
      name: 'TrueBond-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        premiumPlan: state.premiumPlan,
        dailyLikesRemaining: state.dailyLikesRemaining,
        dailyChatsRemaining: state.dailyChatsRemaining,
        boostCount: state.boostCount,
      }),
    }
  )
);
