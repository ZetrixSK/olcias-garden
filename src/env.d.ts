interface ImportMetaEnv {
  /** The Supabase project's address; without it the garden isn't shared. */
  readonly VITE_SUPABASE_URL?: string;
  /** The publishable (anon) key. Never the service_role key: this one ships to every phone. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}
