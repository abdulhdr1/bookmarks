import { type Folder } from "@prisma/client";
import { atom } from "jotai";

type SmallBookmark = {
  id: string;
  url: string;
  title: string;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  createdAt: Date;
};

export const isOpenAtom = atom(false);
export const showMonthsAtom = atom(true);
export const viewStyleAtom = atom<"expanded" | "compact">("compact");
export const currentFolderAtom = atom<Folder | null>(null);
export const foldersAtom = atom<Folder[] | null>(null);
export const bookmarksAtom = atom<SmallBookmark[] | null>([]);
export const bookmarksFilteredAtom = atom<SmallBookmark[] | null>(null);
export const totalBookmarksAtom = atom<number | null>(null);
