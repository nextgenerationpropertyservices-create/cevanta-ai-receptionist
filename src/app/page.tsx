import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { Setup } from '@/components/ui';
export default function Home() { if(isSupabaseConfigured()) redirect('/workspaces'); return <Setup/>; }
