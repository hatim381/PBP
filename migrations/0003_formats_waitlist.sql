-- Mixed team formats and waitlist status (audit: player journey + inscriptions).

alter table tournaments drop constraint if exists tournaments_team_format_check;
alter table tournaments add constraint tournaments_team_format_check
  check (team_format in (
    'tete_a_tete',
    'doublette',
    'doublette_mixte',
    'triplette',
    'triplette_mixte'
  ));

alter table teams drop constraint if exists teams_status_check;
alter table teams add constraint teams_status_check
  check (status in ('pending', 'validated', 'refused', 'cancelled', 'waitlist'));
