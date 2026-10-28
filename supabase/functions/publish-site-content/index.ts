import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';
import { publicationHandler } from '../_shared/publication-handler.mjs';

serve(publicationHandler({ environment: 'test', env: (name: string) => Deno.env.get(name), createClient }));
