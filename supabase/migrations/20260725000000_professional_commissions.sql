-- Unifica a entidade "profissional" da agenda (public.professionals) dentro de
-- public.team_members (RH / Modo Funcionário), e adiciona comissão por
-- profissional calculada automaticamente quando um agendamento é concluído.
--
-- A tabela public.professionals é mantida (sem uso) nesta migration para
-- permitir rollback fácil; será removida numa migration de limpeza futura,
-- depois que a camada de aplicação estiver 100% migrada para team_members.
--
-- NOTA: esta migration é byte-a-byte equivalente (menos comentários) à
-- migration anterior 20260724224451_d132a06e-...sql, que já foi aplicada em
-- produção primeiro. Reescrita aqui de forma idempotente (IF NOT EXISTS /
-- DO blocks com EXCEPTION) só pra garantir que uma reaplicação do histórico
-- completo de migrations do zero (novo ambiente, restore, CI) não quebre
-- tentando recriar os mesmos objetos.

-- 1. Novas colunas em team_members
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS specialties text[],
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS commission_percent numeric(5,2) NOT NULL DEFAULT 0
    CHECK (commission_percent >= 0 AND commission_percent <= 100);

-- 2. Migrar dados de professionals -> team_members preservando os IDs originais
-- (não há sobreposição de UUID entre as duas tabelas, então appointments.professional_id
-- e service_professionals.professional_id continuam válidos sem nenhum remapeamento).
INSERT INTO public.team_members (
  id, user_id, name, email, phone, role, permissions, status,
  specialties, active, commission_percent, created_at, updated_at
)
SELECT
  p.id, p.user_id, p.name, p.email, p.phone,
  'especialista',
  '{}'::jsonb,
  CASE WHEN p.active THEN 'active' ELSE 'inactive' END,
  p.specialties, p.active, 0,
  p.created_at, p.updated_at
FROM public.professionals p
WHERE NOT EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.id = p.id)
ON CONFLICT (id) DO NOTHING;

-- 3. Repontar FKs de professionals -> team_members (mantém o nome da coluna)
DO $$ BEGIN
  ALTER TABLE public.appointments
    ADD CONSTRAINT appointments_professional_id_fkey
    FOREIGN KEY (professional_id) REFERENCES public.team_members(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.service_professionals
  DROP CONSTRAINT IF EXISTS service_professionals_professional_id_fkey;
ALTER TABLE public.service_professionals
  ADD CONSTRAINT service_professionals_professional_id_fkey
  FOREIGN KEY (professional_id) REFERENCES public.team_members(id) ON DELETE CASCADE;

-- 4. Tabela de comissões (histórico imutável do % aplicado em cada atendimento)
CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  team_member_id uuid NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  base_amount numeric(10,2) NOT NULL,
  commission_percent numeric(5,2) NOT NULL,
  commission_amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (appointment_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commissions TO authenticated;
GRANT ALL ON public.commissions TO service_role;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY commissions_owner ON public.commissions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_commissions_team_member ON public.commissions(team_member_id, created_at DESC);

DROP TRIGGER IF EXISTS update_commissions_updated_at ON public.commissions;
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Cálculo automático de comissão na conclusão do agendamento.
-- Cobre tanto o UPDATE feito pelo client quanto a função de banco já
-- existente auto_complete_appointments(), pois ambas fazem UPDATE simples
-- em public.appointments — nenhuma das duas precisa ser alterada.
CREATE OR REPLACE FUNCTION public.calculate_commission_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_percent numeric(5,2);
BEGIN
  IF NEW.status = 'concluido' AND OLD.status IS DISTINCT FROM 'concluido' AND NEW.professional_id IS NOT NULL THEN
    SELECT commission_percent INTO v_percent
    FROM public.team_members
    WHERE id = NEW.professional_id AND user_id = NEW.user_id;

    IF v_percent IS NOT NULL AND v_percent > 0 THEN
      INSERT INTO public.commissions (user_id, team_member_id, appointment_id, base_amount, commission_percent, commission_amount)
      VALUES (NEW.user_id, NEW.professional_id, NEW.id, NEW.price, v_percent, round(NEW.price * v_percent / 100, 2))
      ON CONFLICT (appointment_id) DO UPDATE SET
        base_amount = EXCLUDED.base_amount,
        commission_percent = EXCLUDED.commission_percent,
        commission_amount = EXCLUDED.commission_amount,
        status = 'pending',
        updated_at = now();
    END IF;
  END IF;

  IF OLD.status = 'concluido' AND NEW.status <> 'concluido' THEN
    UPDATE public.commissions SET status = 'cancelled', updated_at = now()
    WHERE appointment_id = NEW.id AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_calculate_commission ON public.appointments;
CREATE TRIGGER trg_calculate_commission
AFTER UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.calculate_commission_on_completion();
