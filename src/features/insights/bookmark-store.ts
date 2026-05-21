import { create } from 'zustand';

// Tracks local bookmark toggles so any FeedCard rendering the same insight on
// any screen (feed, saved, contributions, insight detail) reflects the latest
// state immediately — no waiting for a refetch.
//
// `true` = bookmarked, `false` = unbookmarked, undefined = no local override
// (fall back to whatever the server says).
type BookmarkState = {
  overrides: Record<string, boolean | undefined>;
  set: (id: string, value: boolean) => void;
  clear: (id: string) => void;
};

export const useBookmarkOverrides = create<BookmarkState>((set) => ({
  overrides: {},
  set: (id, value) =>
    set((s) => ({
      overrides: { ...s.overrides, [id]: value },
    })),
  clear: (id) =>
    set((s) => {
      if (!(id in s.overrides)) return s;
      const next = { ...s.overrides };
      delete next[id];
      return { overrides: next };
    }),
}));

export const useBookmarkOverride = (id: string): boolean | undefined =>
  useBookmarkOverrides((s) => s.overrides[id]);
