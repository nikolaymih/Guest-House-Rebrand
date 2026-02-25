import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch {
    // During prerendering (/_not-found, /_global-error) there is no request
    // context, so cookies() throws. Return a client with no cookies — suitable
    // for public reads only.
    return createServerClient(
      url,
      anonKey,
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );
  }

  return createServerClient(
    url,
    anonKey,
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
