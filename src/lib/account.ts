import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const passwordMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    const { requireUserId } = await import("@/lib/auth/verify.server");
    assertSameSiteRequest();
    const userId = await requireUserId(context.bearerToken);
    return next({
      context: { userId, bearerToken: context.bearerToken as string | undefined },
    });
  });

export const setAccountPassword = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ newPassword: z.string().min(8).max(128) }).parse(data),
  )
  .middleware([passwordMiddleware])
  .handler(async ({ data, context }) => {
    const { auth } = await import("@/lib/auth/server");
    const request = getRequest();
    const headers = new Headers(request.headers);
    if (context.bearerToken) {
      headers.set("Authorization", `Bearer ${context.bearerToken}`);
    }
    await auth.api.setPassword({
      body: { newPassword: data.newPassword },
      headers,
    });
    return { ok: true as const };
  });
