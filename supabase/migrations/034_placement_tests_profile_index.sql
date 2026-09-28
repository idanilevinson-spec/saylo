-- src/proxy.ts now queries placement_tests by (profile_id, status) on nearly
-- every protected-page navigation (the "finish the level test first" gate),
-- not just occasionally like the admin check next to it — this table had no
-- index beyond its primary key, so that lookup was a full scan.

create index placement_tests_profile_status_idx
  on public.placement_tests (profile_id, status);
