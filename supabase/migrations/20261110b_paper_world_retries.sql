-- The news column is written at dawn, but Gemini's free models are often busy. Instead of three
-- tries, try every 10 minutes from 03:00 to 06:50 UTC (04:00–07:50 in Poland in winter) until one
-- works; once a day's column is written, the later calls return at once without asking Gemini.
-- The function allows up to 24 tries a day (see supabase/functions/paper-world/index.ts).
-- Each call may wait up to 150 s: a run that retries busy models can take two minutes, and
-- pg_net's default 5 s timeout could cut it off.

select cron.unschedule('paper-world-retry-1');
select cron.unschedule('paper-world-retry-2');
select cron.unschedule('paper-world-dawn');

select cron.schedule('paper-world-dawn', '*/10 3-6 * * *',
  $c$ select net.http_post(url := 'https://bnzwavfiltdemetdmmvg.supabase.co/functions/v1/paper-world', headers := '{"Content-Type": "application/json"}'::jsonb, body := '{}'::jsonb, timeout_milliseconds := 150000) $c$);
