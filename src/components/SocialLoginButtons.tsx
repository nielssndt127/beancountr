"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export function SocialLoginButtons() {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "apple" | null>(null);

  async function handleOAuth(provider: "google" | "apple") {
    setLoadingProvider(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
    // browser will redirect; no need to reset state
  }

  return (
    <div className="space-y-3 mb-6">
      <button
        type="button"
        onClick={() => handleOAuth("google")}
        disabled={loadingProvider !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
        </svg>
        {loadingProvider === "google" ? "Redirecting…" : "Continue with Google"}
      </button>

      <button
        type="button"
        onClick={() => handleOAuth("apple")}
        disabled={loadingProvider !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-60"
      >
        <svg width="16" height="18" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M13.365 12.502c-.292.651-.634 1.25-1.027 1.8-.542.77-1.084 1.302-1.624 1.595-.648.593-1.342.9-2.083.92-.534 0-1.177-.152-1.925-.46-.751-.31-1.44-.462-2.07-.462-.663 0-1.374.153-2.133.462-.76.309-1.37.47-1.834.487-.712.03-1.42-.284-2.126-.944C-.946 15.442-.37 14.81.26 14.14c.693-.752 1.217-1.558 1.569-2.42C2.18 10.816 2.36 9.883 2.36 8.924c0-1.038-.22-1.93-.66-2.672A3.928 3.928 0 0 0 .265 4.777 3.793 3.793 0 0 0-1.673 4.1c.574-.878 1.273-1.578 2.102-2.1.827-.52 1.707-.787 2.638-.8.58 0 1.265.178 2.059.527.79.35 1.298.528 1.52.528.165 0 .726-.208 1.676-.623.9-.386 1.659-.546 2.28-.483 1.687.136 2.955.8 3.797 1.996-1.509.914-2.255 2.195-2.238 3.84.016 1.28.476 2.345 1.377 3.193.41.388.866.688 1.37.9-.11.318-.226.624-.35.922ZM9.894.84C9.894 1.837 9.532 2.76 8.81 3.607 7.936 4.616 6.878 5.196 5.733 5.103a2.35 2.35 0 0 1-.017-.29c0-.958.416-1.982 1.155-2.817.369-.421.838-.771 1.406-1.05.567-.275 1.104-.428 1.61-.457.011.117.017.238.017.351Z" fill="#000"/>
        </svg>
        {loadingProvider === "apple" ? "Redirecting…" : "Continue with Apple"}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-stone-50 px-3 text-xs text-stone-400">or</span>
        </div>
      </div>
    </div>
  );
}
