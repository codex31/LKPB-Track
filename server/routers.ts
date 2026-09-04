import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { clearAdminCookie, hashPassword, isAdminConfigured, isAdminPasswordValid, isAdminSession, isSameOrigin, setAdminCookie, verifyPassword } from "./adminAuth";
import { ensureLkpbSources, getAdminPasswordHash, setAdminPasswordHash, setLkpbSourceEnabled } from "./db";
import { getLkpbDashboard } from "./lkpb";

const adminProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!isAdminSession(ctx.req)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin session required" });
  return next();
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  lkpb: router({
    dashboard: publicProcedure.query(() => getLkpbDashboard()),
    admin: router({
      login: publicProcedure.input(z.object({ username: z.string().min(1), password: z.string().min(1) })).mutation(async ({ input, ctx }) => {
        if (!isSameOrigin(ctx.req)) throw new TRPCError({ code: "FORBIDDEN", message: "Origin tidak diizinkan" });
        if (!isAdminConfigured()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Admin credentials belum dikonfigurasi di server" });
        if (input.username !== "admin" || !(await isAdminPasswordValid(input.password))) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Username atau password salah" });
        }
        setAdminCookie(ctx.res);
        return { success: true, username: "admin" } as const;
      }),
      me: publicProcedure.query(({ ctx }) => ({ authenticated: isAdminSession(ctx.req), username: isAdminSession(ctx.req) ? "admin" : null })),
      logout: publicProcedure.mutation(({ ctx }) => { clearAdminCookie(ctx.res); return { success: true } as const; }),
      sources: adminProcedure.query(() => ensureLkpbSources()),
      toggleSource: adminProcedure.input(z.object({ sourceKey: z.string().min(1), enabled: z.boolean() })).mutation(({ input, ctx }) => {
        if (!isSameOrigin(ctx.req)) throw new TRPCError({ code: "FORBIDDEN", message: "Origin tidak diizinkan" });
        return setLkpbSourceEnabled(input.sourceKey, input.enabled);
      }),
      changePassword: adminProcedure.input(z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(4) })).mutation(async ({ input, ctx }) => {
        if (!isSameOrigin(ctx.req)) throw new TRPCError({ code: "FORBIDDEN", message: "Origin tidak diizinkan" });
        const dbHash = await getAdminPasswordHash();
        const currentOk = dbHash ? verifyPassword(input.currentPassword, dbHash) : input.currentPassword === "admin";
        if (!currentOk) throw new TRPCError({ code: "UNAUTHORIZED", message: "Password lama salah" });
        await setAdminPasswordHash(hashPassword(input.newPassword));
        return { success: true } as const;
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
