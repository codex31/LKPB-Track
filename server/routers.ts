import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { clearAdminCookie, isAdminSession, setAdminCookie, ADMIN_PASSWORD, ADMIN_USERNAME } from "./adminAuth";
import { ensureLkpbSources, setLkpbSourceEnabled } from "./db";
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
      login: publicProcedure.input(z.object({ username: z.string().min(1), password: z.string().min(1) })).mutation(({ input, ctx }) => {
        if (input.username !== ADMIN_USERNAME || input.password !== ADMIN_PASSWORD) throw new TRPCError({ code: "UNAUTHORIZED", message: "Username atau password salah" });
        setAdminCookie(ctx.res);
        return { success: true, username: ADMIN_USERNAME } as const;
      }),
      me: publicProcedure.query(({ ctx }) => ({ authenticated: isAdminSession(ctx.req), username: isAdminSession(ctx.req) ? ADMIN_USERNAME : null })),
      logout: publicProcedure.mutation(({ ctx }) => { clearAdminCookie(ctx.res); return { success: true } as const; }),
      sources: adminProcedure.query(() => ensureLkpbSources()),
      toggleSource: adminProcedure.input(z.object({ sourceKey: z.string().min(1), enabled: z.boolean() })).mutation(({ input }) => setLkpbSourceEnabled(input.sourceKey, input.enabled)),
    }),
  }),
});

export type AppRouter = typeof appRouter;
