import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BookmarksList } from "~/components/BookmarksList";
import { EmptyState } from "~/components/EmptyState";
import { RectangleSkeleton } from "~/components/RectangleSkeleton";
import { ScrollToTopButton } from "~/components/ScrollToTopButton";
import { Separator } from "~/components/Separator";
import { ShareLinkButton } from "~/components/ShareLinkButton";
import { ShowMonthsButton } from "~/components/ShowMonthsButton";
import { SkeletonList } from "~/components/SkeletonList";
import { Spinner } from "~/components/Spinner";
import { ThemeButton } from "~/components/ThemeButton";
import { ViewButton } from "~/components/ViewButton";
import { getFaviconForFolder } from "~/helpers/getFaviconForFolder";
import { api } from "~/utils/api";

type SmallBookmark = {
  id: string;
  url: string;
  title: string;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  createdAt: Date;
};

export default function Bookmarks() {
  const router = useRouter();
  const { folderId } = router.query;
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [showMonths, setShowMonths] = useState(true);
  const [bookmarks, setBookmarks] = useState<SmallBookmark[] | null>(null);
  const [viewStyle, setViewStyle] = useState<"expanded" | "compact">("compact");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookmarks, setTotalBookmarks] = useState(0);

  const bookmarksQuery = api.bookmarks.findByFolderId.useQuery(
    {
      folderId: String(folderId),
      page: currentPage,
    },
    {
      enabled: Boolean(folderId),
      onSuccess: (data) => {
        if (data) {
          setBookmarks((prev) => {
            if (prev) {
              const newBookmarks = data.bookmarks.filter((bookmark) => {
                return !prev.find(
                  (prevBookmark) => prevBookmark.id === bookmark.id
                );
              });

              return [...prev, ...newBookmarks];
            } else {
              return data.bookmarks;
            }
          });
          setTotalBookmarks(data.totalElements);

          setTimeout(() => {
            setIsOpen(true);
          }, 10);
        }
      },
    }
  );

  const folder = api.folders.findById.useQuery(
    {
      id: String(folderId),
    },
    {
      enabled: Boolean(folderId),
    }
  );

  const handleChangeViewStyle = () => {
    setIsOpen(false);

    setTimeout(() => {
      setIsOpen(true);
    }, 10);

    setViewStyle(viewStyle === "compact" ? "expanded" : "compact");
  };

  const handleChangeTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleShowMonths = () => {
    setIsOpen(false);

    setTimeout(() => {
      setIsOpen(true);
    }, 10);

    setShowMonths(!showMonths);
  };

  // update page when scroll to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        if (bookmarks?.length !== totalBookmarks && !bookmarksQuery.isLoading) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [bookmarks?.length, totalBookmarks, bookmarksQuery.isLoading]);

  return (
    <>
      <Head>
        <title>{folder?.data?.name ?? "Bookmarks"}</title>
        <link rel="icon" href={getFaviconForFolder(folder.data)} />
        <meta
          name="description"
          content="Looking for cool bookmarks? Check out this folder!"
        />
        <meta property="og:title" content={folder?.data?.name ?? "Bookmarks"} />
        <meta
          property="og:description"
          content="Looking for cool bookmarks? Check out this folder!"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content={`https://bookmarks.gustavofior.com/api/og`}
        />
      </Head>
      <main className="flex min-h-screen w-full flex-col items-center bg-[#e0e0e0] dark:bg-[#161616]">
        <ScrollToTopButton />

        <div className="w-[20rem] py-16 sm:w-[30rem] md:w-[40rem] lg:w-[50rem]">
          <AnimatePresence mode="wait">
            <div className="flex flex-col items-center justify-between gap-8 px-2 align-middle font-semibold text-black dark:text-white md:flex-row md:gap-0">
              {folder?.isLoading ? (
                <motion.div
                  key="folderNameLoading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pt-2"
                >
                  <RectangleSkeleton />
                </motion.div>
              ) : (
                <motion.div
                  key="folderNameLoaded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {folder?.data?.isShared ? (
                    <div className="flex items-center gap-3 align-middle">
                      <p className="text-3xl">{folder?.data?.icon}</p>
                      <p className="text-3xl">{folder?.data?.name}</p>
                    </div>
                  ) : (
                    <p className="text-3xl">🔒 This folder is private</p>
                  )}
                </motion.div>
              )}
              {folder?.data?.isShared && (
                <div className="flex items-center gap-6 align-middle md:gap-2">
                  <motion.div
                    key="viewButtonLoaded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ViewButton
                      viewStyle={viewStyle}
                      handleChangeViewStyle={handleChangeViewStyle}
                    />
                  </motion.div>
                  <motion.div
                    key="themeButtonLoaded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ThemeButton
                      theme={theme ?? ""}
                      handleChangeTheme={handleChangeTheme}
                    />
                  </motion.div>
                  <motion.div
                    key="showMonthsButtonLoaded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ShowMonthsButton
                      showMonths={showMonths}
                      handleShowMonths={handleShowMonths}
                    />
                  </motion.div>
                  <motion.div
                    key="shareLinkButtonLoaded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ShareLinkButton folderId={folderId as string} />
                  </motion.div>
                </div>
              )}
            </div>
          </AnimatePresence>

          <div className={`mx-2 mt-6`}>
            <Separator />
          </div>

          {(folder?.isLoading || bookmarksQuery.isLoading) && (
            <SkeletonList viewStyle={viewStyle} />
          )}
          {folder?.data?.isShared && (
            <motion.div initial={false} animate={isOpen ? "open" : "closed"}>
              <motion.ul className={`flex flex-col`}>
                {bookmarks && bookmarks.length > 0 && (
                  <BookmarksList
                    bookmarks={bookmarks}
                    showMonths={showMonths}
                    viewStyle={viewStyle}
                  />
                )}
                {bookmarks &&
                  bookmarks.length === 0 &&
                  !folder?.isLoading &&
                  !bookmarksQuery.isLoading && <EmptyState />}
              </motion.ul>
            </motion.div>
          )}
          <div className="flex justify-center pt-10 align-middle">
            {bookmarksQuery.isFetching &&
              bookmarks &&
              bookmarks?.length > 0 &&
              currentPage > 1 && <Spinner size="md" />}
          </div>
        </div>
      </main>
    </>
  );
}
