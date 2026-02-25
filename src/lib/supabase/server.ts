import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch {
    // During prerendering (/_not-found, /_global-error) there is no request
    // context, so cookies() throws. Return a client with no cookies — suitable
    // for public reads only.
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — cookie writes are ignored.
            // Session refresh is handled by the proxy middleware instead.
          }
        },
      },
    }
  );
}
