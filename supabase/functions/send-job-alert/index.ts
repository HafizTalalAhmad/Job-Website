// Supabase Edge Function: send-job-alert
// Required secrets:
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
// - RESEND_API_KEY
// - RESEND_FROM_EMAIL

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
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || ''
    const resendFromEmail = Deno.env.get('RESEND_FROM_EMAIL') || ''

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !resendFromEmail) {
      throw new Error('Missing required function secrets.')
    }

    const { job } = await request.json()
    if (!job?.title || !job?.organization || !job?.applyLink) {
      throw new Error('Job payload is incomplete.')
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('email')
      .eq('is_active', true)

    if (subscribersError) {
      throw subscribersError
    }

    const emails = (subscribers || []).map((item) => item.email).filter(Boolean)
    if (!emails.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    const subject = `${job.organization}: ${job.title}`
    const html = `
      <div style="font-family: Arial, sans-serif; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">${job.title}</h2>
        <p style="margin: 0 0 8px;"><strong>Organization:</strong> ${job.organization}</p>
        <p style="margin: 0 0 8px;"><strong>Location:</strong> ${job.city || '-'}, ${job.province || '-'}, ${job.country || 'In Pakistan'}</p>
        <p style="margin: 0 0 8px;"><strong>Deadline:</strong> ${job.deadline || '-'}</p>
        <p style="margin: 0 0 16px;">${job.summary || ''}</p>
        <p style="margin: 0 0 16px;">
          <a href="${job.applyLink}" style="display: inline-block; background: #166b2f; color: #fff; text-decoration: none; padding: 10px 14px;">Apply Now</a>
        </p>
      </div>
    `

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: emails,
        subject,
        html
      })
    })

    if (!resendResponse.ok) {
      const message = await resendResponse.text()
      throw new Error(message || 'Email provider rejected request.')
    }

    return new Response(JSON.stringify({ sent: emails.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
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
