alter table public.bots
  add column if not exists slug text;

with ranked_bots as (
  select
    id,
    nullif(
      trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')),
      ''
    ) as base_slug,
    row_number() over (
      partition by trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'))
      order by created_at, id
    ) as slug_rank
  from public.bots
)
update public.bots as bots
set slug = case
  when ranked_bots.base_slug is null then concat('bot-', left(replace(bots.id::text, '-', ''), 8))
  when ranked_bots.slug_rank = 1 then ranked_bots.base_slug
  else concat(ranked_bots.base_slug, '-', ranked_bots.slug_rank)
end
from ranked_bots
where bots.id = ranked_bots.id
  and (bots.slug is null or bots.slug = '');

update public.bots
set slug = concat('bot-', left(replace(id::text, '-', ''), 8))
where slug is null or slug = '';

alter table public.bots
  alter column slug set not null;

create unique index if not exists bots_slug_uidx on public.bots (slug);
