import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const foldersRouter = createTRPCRouter({
  findById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        direction: z.enum(["asc", "desc"]).nullable(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.folder.findUnique({
        where: {
          id: input.id,
        },
        include: {
          bookmarks: {
            orderBy: {
              createdAt: input.direction ?? "desc",
            },
          },
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        icon: z.string().nullable(),
        userId: z.string().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = input.userId ?? ctx.session.user.id;

      return await ctx.prisma.folder.create({
        data: {
          name: input.name,
          icon: input.icon ?? undefined,
          userId: userId,
        },
      });
    }),
  findByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string().nullable(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = input.userId ?? ctx.session.user.id;

      const user = await ctx.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      const lastDirection : "asc" | "desc" = user?.lastDirection as "asc" | "desc" ?? "desc";

      return await ctx.prisma.folder.findMany({
        where: {
          userId: userId,
        },
        include: {
          bookmarks: {
            orderBy: {
              createdAt: lastDirection,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.folder.delete({
        where: {
          id: input.id,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
        icon: z.string().nullable(),
        isShared: z.boolean().nullable(),
        allowDuplicate: z.boolean().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.folder.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name ?? undefined,
          icon: input.icon ?? undefined,
          isShared: input.isShared ?? undefined,
          updatedAt: new Date(),
          allowDuplicate: input.allowDuplicate ?? undefined,
        },
      });
    }),
});
