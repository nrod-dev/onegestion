import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Prevent crash if env vars are missing (e.g. in preview)
export const supabase = (supabaseUrl && supabaseKey && supabaseUrl !== 'YOUR_SUPABASE_URL')
    ? createClient(supabaseUrl, supabaseKey)
    : {
        from: () => {
            const dummyChain = {
                select: () => dummyChain,
                order: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }),
                insert: () => dummyChain,
                single: () => Promise.resolve({ data: {}, error: { message: 'Supabase not configured' } }),
                lt: () => dummyChain,
                gt: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }),
                // Add more as needed
            };
            return dummyChain;
        }
    };
