-- "Equipe" (team_members) hoje mistura dois conceitos de negócio diferentes
-- sob o mesmo limite de plano (activeUsers, 1/2/5 no trial/professional/
-- premium): quem OPERA o sistema (login/PIN) e quem é apenas um
-- PROFISSIONAL atendendo cliente (aparece na agenda/serviço, nunca loga).
-- Um salão pode ter 1 dono logado e 10 profissionais na cadeira — hoje isso
-- era bloqueado pelo limite de seats, mesmo o profissional nunca acessando
-- o sistema.
--
-- counts_as_seat resolve isso sem quebrar a unificação já feita em
-- 20260725000000 (comissões, service_professionals, appointments.professional_id
-- continuam apontando pra team_members.id) — só marca quem consome vaga do
-- plano. Default true preserva o comportamento atual pra todo mundo que já
-- existe; só cadastros novos marcados como "apenas profissional" ficam de fora
-- da contagem.
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS counts_as_seat boolean NOT NULL DEFAULT true;
