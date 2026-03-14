// Supabase Edge Function: auto-archive-jobs
// Archives jobs when deadline is older than 30 days.
// Required secrets:
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required function secrets.')
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const cutoffDate = new Date()
    cutoffDate.setUTCDate(cutoffDate.getUTCDate() - 30)
    const cutoff = cutoffDate.toISOString().slice(0, 10)

    const { data: jobsToArchive, error: fetchError } = await supabase
      .from('jobs_public')
      .select('id, title, organization, deadline')
      .eq('is_archived', false)
      .lte('deadline', cutoff)

    if (fetchError) {
      throw fetchError
    }

    if (!jobsToArchive?.length) {
      return new Response(JSON.stringify({ archived: 0, cutoff }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    const ids = jobsToArchive.map((job) => job.id)

    const { error: updateError } = await supabase
      .from('jobs_public')
      .update({ is_archived: true })
      .in('id', ids)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({
        archived: ids.length,
        cutoff,
        jobs: jobsToArchive
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
