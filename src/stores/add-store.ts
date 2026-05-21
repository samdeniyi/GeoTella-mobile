import { create } from 'zustand';

import type { GrowthRating } from '@/features/insights/api/insights-api';

export type AddLocation = {
  name: string;
  address?: string;
  coords: { lat: number; lng: number };
  // Free-text place names pulled from Google geocoding — sent to the backend's
  // /submit-by-name endpoint.
  country?: string;
  region?: string;
  city?: string;
};

export type AddPhoto = {
  uri: string;
  name?: string;
  type?: string;
};

export type ContributeData = {
  // When set, the contribute flow patches this insight instead of creating one.
  editingId?: string;
  location: AddLocation | null;
  categoryId: string;
  categoryName?: string;
  growthSignal: GrowthRating;
  headline: string;
  description: string;
  photo?: AddPhoto;
  sourceLink?: string;
  verifierNotes?: string;
};

type AddState = {
  data: ContributeData;
  setData: (data: Partial<ContributeData>) => void;
  reset: () => void;
};

const initialState: ContributeData = {
  editingId: undefined,
  location: null,
  categoryId: '',
  categoryName: undefined,
  growthSignal: 'WARMING',
  headline: '',
  description: '',
  photo: undefined,
  sourceLink: '',
  verifierNotes: '',
};

export const useAddStore = create<AddState>((set) => ({
  data: initialState,
  setData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
  reset: () => set({ data: initialState }),
}));
