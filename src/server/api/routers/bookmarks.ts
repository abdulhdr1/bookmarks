import { z } from "zod";
import { getBookmarkMetadata } from "~/helpers/getBookmarkMetadata";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const bookmarksRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        url: z.string(),
        folderId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const folder = await ctx.prisma.folder.findUnique({
        where: {
          id: input.folderId,
        },
      });

      if (!folder?.allowDuplicate) {
        const existingBookmark = await ctx.prisma.bookmark.findFirst({
          where: {
            url: input.url,
            folderId: input.folderId,
          },
        });

        if (existingBookmark) {
          throw Error("Bookmark already exists");
        }
      }

      const { title, faviconUrl, ogImageUrl, description } = await getBookmarkMetadata(
        input.url
      );

      return await ctx.prisma.bookmark.create({
        data: {
          url: input.url,
          title: title,
          faviconUrl: faviconUrl,
          ogImageUrl: ogImageUrl,
          description: description,
          folderId: input.folderId,
        },
      });
    }),
  findByFolderId: publicProcedure
    .input(
      z.object({
        folderId: z.string(),
        page: z.number().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (input.folderId) {
        const bookmarks = input.page ? await ctx.prisma.bookmark.findMany({
          where: {
            folderId: input.folderId,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            url: true,
            title: true,
            faviconUrl: true,
            ogImageUrl: true,
            createdAt: true,
          },
          skip: input.page ? (input.page - 1) * 35 : 0,
          take: 35,
        }) : await ctx.prisma.bookmark.findMany({
          where: {
            folderId: input.folderId,
            OR: [
              {
                title: {
                  contains: input.search,
                  mode: "insensitive",
                },
              },
              {
                url: {
                  contains: input.search,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: input.search,
                  mode: "insensitive",
                },
              }
            ],
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            url: true,
            title: true,
            faviconUrl: true,
            ogImageUrl: true,
            createdAt: true,
          },
        });

        const totalElements = await ctx.prisma.bookmark.count({
          where: {
            folderId: input.folderId,
          },
        });

        return {
          bookmarks,
          totalElements,
        };
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.bookmark.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
