#!/usr/bin/env python3
"""Gera o relatório de auditoria de segurança do Plushify em PDF.

Rode com o venv local (docs/security-audit/venv):
    source venv/bin/activate && python3 generate_report.py
"""
import datetime
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
    TableStyle, Image, PageBreak, KeepTogether, NextPageTemplate, FrameBreak,
    HRFlowable,
)
from reportlab.platypus.flowables import Flowable

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_PDF = os.path.join(HERE, "relatorio-auditoria-seguranca.pdf")
ASSETS = os.path.join(HERE, "_assets")
os.makedirs(ASSETS, exist_ok=True)

PROJECT_NAME = "Plushify"
AUDIT_DATE = datetime.date.today().strftime("%d/%m/%Y")

SEV_COLORS = {
    "Crítica": "#B91C1C",
    "Alta": "#EA580C",
    "Média": "#D97706",
    "Baixa": "#2563EB",
    "Informativa": "#6B7280",
}
STRONG_COLOR = "#059669"
INK = "#1F2937"
MUTED = "#6B7280"
BORDER = "#E5E7EB"

# ---------------------------------------------------------------------------
# Dados da auditoria (consolidados do relatório do agente)
# ---------------------------------------------------------------------------

FINDINGS = [
    dict(
        id="F1",
        categoria="IDOR",
        severidade="Alta",
        arquivo="supabase/functions/abacate-webhook/index.ts",
        linhas="132-321",
        titulo="Autenticidade do webhook de pagamento depende só de secret estático em query string",
        trecho=(
            "const receivedSecret = url.searchParams.get('webhookSecret')\n"
            "if (!receivedSecret || !secretsMatch(receivedSecret, expectedSecret)) { ...401 }\n"
            "...\n"
            "let parsed = parseExternalId(externalId) // \"plushify:<userId>:<planType>:...\"\n"
            "await admin.rpc('start_subscription', { p_user_id: userId, p_plan_code: planType, ... })"
        ),
        descricao=(
            "O webhook da AbacatePay ativa/revoga assinatura paga de um userId inteiramente a partir "
            "do external_id/metadata do payload recebido, sem verificação HMAC de assinatura do corpo "
            "da requisição — apenas um segredo estático comparado em tempo constante, mas transmitido "
            "via query string (não em header), onde fica mais sujeito a vazar em logs de proxy/CDN/"
            "observabilidade."
        ),
        exploracao=(
            "Quem obtiver o webhookSecret pode forjar um POST para ativar (ou revogar) o plano pago de "
            "qualquer userId à vontade, sem precisar de uma transação real na AbacatePay."
        ),
        condicoes=(
            "Depende de exposição do webhookSecret (não encontrada vazada nesta auditoria — é env var, "
            "não hardcoded no código). O risco é o modelo de confiança em si: um único segredo em URL, "
            "sem assinatura de payload, é uma limitação documentada do provedor AbacatePay, não um bug "
            "de implementação do Plushify."
        ),
    ),
    dict(
        id="F2",
        categoria="Permissão no navegador",
        severidade="Baixa",
        arquivo="supabase/migrations/20251005144801_*.sql (função has_role) + 20260728030000_admin_dashboard_foundation.sql",
        linhas="30-43 / 52-55",
        titulo="RPC has_role aceita _user_id arbitrário — permite enumerar quem é admin",
        trecho=(
            "-- has_role(uuid, app_role) é SECURITY DEFINER e recebe _user_id livre\n"
            "GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;\n"
            "-- chamada possível do client:\n"
            "supabase.rpc('has_role', { _user_id: '<uuid-de-outro-usuário>', _role: 'admin' })"
        ),
        descricao=(
            "A função has_role() não força _user_id = auth.uid(): qualquer usuário autenticado pode "
            "consultar se um UUID arbitrário tem papel de admin."
        ),
        exploracao=(
            "Não escala privilégio por si só (todas as 116 RPCs admin_* sempre usam has_role(auth.uid(), "
            "'admin'), nunca o valor vindo do client) — mas permite enumerar quais UUIDs são "
            "administradores da plataforma, útil para preparar phishing/engenharia social direcionada."
        ),
        condicoes="Usuário só precisa estar autenticado; nenhuma outra pré-condição.",
    ),
    dict(
        id="F3",
        categoria="IDOR / XSS",
        severidade="Baixa",
        arquivo="src/components/admin/prospects/ProspectDetailDialog.tsx",
        linhas="179",
        titulo="Campo social_link renderizado em href sem validar esquema (self-XSS)",
        trecho=(
            "<a href={prospect.social_link} target=\"_blank\" "
            "rel=\"noopener noreferrer\">"
        ),
        descricao=(
            "social_link é texto livre gravado só por admins via admin_create_prospect/"
            "admin_update_prospect (ambos com gate de admin no servidor). O valor é usado direto num "
            "atributo href sem checar o esquema da URL."
        ),
        exploracao=(
            "Um admin poderia gravar javascript:... no próprio campo e executá-lo na própria sessão ao "
            "clicar no link. Não é IDOR real (não afeta outros usuários) — é self-XSS de baixo impacto, "
            "mas fácil de corrigir."
        ),
        condicoes="Exige que o próprio admin insira uma URL maliciosa e clique nela.",
    ),
    dict(
        id="F4",
        categoria="Permissão no navegador",
        severidade="Informativa",
        arquivo="supabase/functions/validate-plan-security/index.ts",
        linhas="—",
        titulo="Endpoint vestigial sem gate de ação de cobrança relevante",
        trecho="(endpoint de telemetria/auditoria, escopado ao próprio user.id do JWT)",
        descricao=(
            "A validação de preço que realmente importa está em abacate-create-checkout/"
            "abacate-create-subscription, que revalidam contra o catálogo real da AbacatePay no "
            "servidor. Este endpoint não expõe ação sensível."
        ),
        exploracao="Sem impacto de segurança identificado.",
        condicoes="—",
    ),
    dict(
        id="F5",
        categoria="XSS",
        severidade="Informativa",
        arquivo="src/main.tsx",
        linhas="71-78",
        titulo="innerHTML com mensagem de erro global crua",
        trecho="el.innerHTML = `... ${e.message} ...` // handler de erro fatal global",
        descricao=(
            "A mensagem de erro (e.message) é interpolada direto em innerHTML no handler de erro fatal "
            "no bootstrap da aplicação."
        ),
        exploracao=(
            "Nenhum caminho identificado nesta auditoria onde input controlado por usuário chegue a essa "
            "mensagem de erro — mas por defesa em profundidade, textContent seria mais seguro que "
            "innerHTML nesse ponto."
        ),
        condicoes="Exigiria uma exceção cujo .message fosse, de alguma forma, controlável por um atacante.",
    ),
]

STRENGTHS = [
    ("RLS", "supabase/migrations (68 tabelas ativas em public)",
     "100% das tabelas vivas em public têm ROW LEVEL SECURITY habilitado. Tabelas financeiras/PII "
     "(payments, clients, appointments, financial_transactions etc.) usam policy owner-scoped "
     "FOR ALL USING (user_id = auth.uid()) — verificado em 20260608174652_*.sql:446-465."),
    ("RLS", "20260801040000_enforce_aal2_defense_in_depth.sql:56-70",
     "Policy RESTRICTIVE aplicada dinamicamente a toda tabela com RLS no schema public, exigindo AAL2 "
     "(2FA) para quem tem TOTP habilitado — fecha a lacuna de um token AAL1 vazado sendo usado via API "
     "direta, contornando o gate de MFA da UI."),
    ("RLS", "20260814190000_move_prospects_to_internal_schema.sql:9-11",
     "Tabelas de prospecção (prospects, prospect_interactions, prospectors) movidas para o schema "
     "internal, fora da API pública do PostgREST — acesso só via 14 RPCs admin_* com checagem de "
     "has_role() como primeira linha."),
    ("RLS", "20260814170000_tighten_grants_bug_bounty.sql",
     "Migration de hardening dedicada (referencia relatório de bug bounty anterior) que revoga "
     "TRUNCATE/DELETE/UPDATE desnecessários em audit_logs, commissions, financial_transactions, "
     "user_roles, mesmo sem policy que os tornasse exploráveis — redução de superfície defensiva."),
    ("RLS", "user_roles — 20260728030000_admin_dashboard_foundation.sql:57-78",
     "Tabela de privilégio sem policy de UPDATE (bloqueada por padrão); INSERT/DELETE restritos a "
     "has_role(auth.uid(),'admin'). Nenhum caminho de auto-promoção a admin encontrado."),
    ("RLS", "20260730000000_remove_whatsapp_residue.sql",
     "20 tabelas legadas do módulo WhatsApp abandonado (com policies USING (true), as únicas "
     "encontradas em todo o repositório) foram completamente removidas após confirmar que nada em "
     "src/ ou edge functions dependia delas."),
    ("Permissão no navegador", "src/hooks/useIsAdmin.ts:5-29",
     "Hook documentado como uso exclusivo de UI; RPC has_role sempre chamada com o próprio "
     "user!.id (auth.uid()), nunca dado sensível extra retornado ao client."),
    ("Permissão no navegador", "116 funções admin_* nas 271 migrations",
     "Todas, sem exceção, começam com IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION "
     "— a checagem de privilégio é sempre no servidor, nunca delegada ao frontend."),
    ("Permissão no navegador", "abacate-refund-checkout/index.ts:57-66 e abacate-manage-coupons",
     "Checagem de admin feita no servidor com userId vindo de getClaims(token) (JWT verificado), nunca "
     "de flag enviado pelo cliente."),
    ("IDOR", "19/19 edge functions lidas por completo",
     "Padrão consistente: ID do usuário sempre derivado do JWT (getClaims), nunca aceito como parâmetro "
     "confiável do cliente. delete-account, whatsapp-proxy, abacate-refund-checkout, start-trial "
     "confirmam posse do recurso antes de agir."),
    ("IDOR", "secure-login / secure-signup",
     "Mensagens de erro genéricas anti-enumeração (correção documentada de bug bounty anterior), "
     "rate-limit por IP via check_public_rate_limit."),
    ("IDOR", "abacate-create-checkout / abacate-create-subscription / abacate-create-upgrade-checkout",
     "Preço sempre revalidado contra o catálogo real da AbacatePay no servidor — nunca aceito do "
     "cliente diretamente."),
    ("Chaves expostas", "Repositório completo + git log --all -p",
     "Nenhum .env real no working tree (.gitignore cobre .env/.env.*); zero ocorrências de chave real "
     "em código, config, migrations ou histórico git; SERVICE_ROLE_KEY usada só server-side em edge "
     "functions, nunca no bundle do frontend."),
    ("XSS", "src/ (6 ocorrências de dangerouslySetInnerHTML/innerHTML)",
     "Todas com conteúdo estático ou gerado por código do próprio dev (ex: chart.tsx a partir de "
     "ChartConfig), nunca input livre de usuário. Nenhum eval()/new Function() encontrado."),
    ("XSS", "auth-email-hook + _shared/email-templates/*.tsx",
     "E-mails renderizados via React Email (JSX com auto-escape), não pelos .html estáticos "
     "(magic-link-email.html etc. usam apenas sintaxe nativa do GoTrue, preenchida pelo próprio "
     "Supabase Auth)."),
]

RECOMMENDATIONS = [
    ("P1", "Adicionar verificação HMAC de assinatura do payload no webhook da AbacatePay",
     "Somar ao secret de query string uma verificação de assinatura do corpo (se o provedor suportar) "
     "ou, no mínimo, mover o secret para header e adicionar checagem de idempotência/replay por "
     "identificador de evento já processado."),
    ("P2", "Restringir has_role() para não aceitar _user_id arbitrário de client não-privilegiado",
     "Criar uma RPC pública separada (ex: has_role_self()) que ignora o parâmetro e sempre usa "
     "auth.uid(), e restringir has_role(uuid,...) a chamadas server-side/RPCs internas."),
    ("P3", "Validar esquema de URL antes de renderizar em href (social_link e campos livres similares)",
     "Adicionar uma função utilitária isSafeUrl() que aceite apenas http:/https:/mailto: e aplicá-la "
     "em todo href/src alimentado por campo de texto livre gravado via UI administrativa."),
    ("P4", "Trocar innerHTML por textContent no handler de erro fatal global (src/main.tsx)",
     "Defesa em profundidade — elimina de vez a possibilidade de HTML injetado nessa mensagem, mesmo "
     "que hoje nenhum caminho de exploração tenha sido identificado."),
    ("P5", "Remover ou proteger o endpoint validate-plan-security se não estiver mais em uso ativo",
     "Reduzir superfície de ataque removendo código vestigial, ou documentar claramente seu propósito "
     "atual se ainda for necessário."),
]

# ---------------------------------------------------------------------------
# Gráficos
# ---------------------------------------------------------------------------

def sev_count():
    order = ["Crítica", "Alta", "Média", "Baixa", "Informativa"]
    counts = {s: 0 for s in order}
    for f in FINDINGS:
        counts[f["severidade"]] += 1
    return order, counts


def make_donut():
    order, counts = sev_count()
    labels = [f"{s} ({counts[s]})" for s in order if counts[s] > 0]
    sizes = [counts[s] for s in order if counts[s] > 0]
    colors_ = [SEV_COLORS[s] for s in order if counts[s] > 0]

    fig, ax = plt.subplots(figsize=(4.6, 4.2), dpi=200)
    wedges, _ = ax.pie(
        sizes, colors=colors_, startangle=90, counterclock=False,
        wedgeprops=dict(width=0.42, edgecolor="white", linewidth=2),
    )
    ax.legend(
        wedges, labels, loc="center", bbox_to_anchor=(0.5, 0.5),
        frameon=False, fontsize=9, labelcolor=INK,
    )
    total = sum(sizes)
    ax.text(0, 0, "", ha="center", va="center")
    ax.set(aspect="equal")
    fig.patch.set_alpha(0)
    plt.tight_layout()
    path = os.path.join(ASSETS, "donut_severidade.png")
    fig.savefig(path, transparent=True)
    plt.close(fig)
    return path


def make_bars():
    cats = {}
    for f in FINDINGS:
        cats.setdefault(f["categoria"], []).append(f["severidade"])

    cat_names = list(cats.keys())
    order = ["Crítica", "Alta", "Média", "Baixa", "Informativa"]

    fig, ax = plt.subplots(figsize=(7.6, 4.0), dpi=200)
    bottom = [0] * len(cat_names)
    for sev in order:
        vals = [cats[c].count(sev) for c in cat_names]
        if sum(vals) == 0:
            continue
        ax.bar(cat_names, vals, bottom=bottom, color=SEV_COLORS[sev], label=sev, width=0.55)
        bottom = [b + v for b, v in zip(bottom, vals)]

    ax.set_ylabel("Nº de achados", color=INK, fontsize=10)
    ax.tick_params(axis="x", labelrotation=12, labelsize=8.5, colors=INK)
    ax.tick_params(axis="y", labelsize=9, colors=INK)
    ax.spines[["top", "right"]].set_visible(False)
    ax.spines[["left", "bottom"]].set_color(BORDER)
    ax.set_yticks(range(0, max(sum(v) for v in [ [cats[c].count(s) for s in order] for c in cat_names]) + 2))
    ax.legend(frameon=False, fontsize=8, ncols=3, loc="upper center", bbox_to_anchor=(0.5, 1.22))
    fig.patch.set_alpha(0)
    plt.tight_layout()
    path = os.path.join(ASSETS, "barras_categoria.png")
    fig.savefig(path, transparent=True)
    plt.close(fig)
    return path


# ---------------------------------------------------------------------------
# PDF
# ---------------------------------------------------------------------------

styles = getSampleStyleSheet()
styles.add(ParagraphStyle("CoverTitle", fontSize=26, leading=31, textColor=colors.HexColor(INK),
                           fontName="Helvetica-Bold", spaceAfter=6))
styles.add(ParagraphStyle("CoverSub", fontSize=13, leading=18, textColor=colors.HexColor(MUTED),
                           fontName="Helvetica"))
styles.add(ParagraphStyle("H1", fontSize=17, leading=21, textColor=colors.HexColor(INK),
                           fontName="Helvetica-Bold", spaceBefore=4, spaceAfter=10))
styles.add(ParagraphStyle("H2", fontSize=13, leading=17, textColor=colors.HexColor(INK),
                           fontName="Helvetica-Bold", spaceBefore=12, spaceAfter=6))
styles.add(ParagraphStyle("Body", fontSize=9.6, leading=14, textColor=colors.HexColor(INK),
                           fontName="Helvetica", alignment=TA_LEFT))
styles.add(ParagraphStyle("BodyMuted", fontSize=9, leading=13, textColor=colors.HexColor(MUTED),
                           fontName="Helvetica"))
styles.add(ParagraphStyle("Mono", fontSize=8, leading=11, fontName="Courier",
                           textColor=colors.HexColor(INK), backColor=colors.HexColor("#F3F4F6")))
styles.add(ParagraphStyle("TableCell", fontSize=8.4, leading=11.5, textColor=colors.HexColor(INK),
                           fontName="Helvetica"))
styles.add(ParagraphStyle("TableCellBold", fontSize=8.6, leading=11.5, textColor=colors.HexColor(INK),
                           fontName="Helvetica-Bold"))
styles.add(ParagraphStyle("IssueTitle", fontSize=11, leading=14, textColor=colors.HexColor(INK),
                           fontName="Helvetica-Bold", spaceBefore=8, spaceAfter=4))


def sev_chip(sev):
    color = SEV_COLORS.get(sev, MUTED)
    return Table(
        [[Paragraph(f'<font color="white"><b>{sev.upper()}</b></font>', ParagraphStyle(
            "chip", fontSize=7.6, alignment=TA_CENTER, textColor=colors.white))]],
        colWidths=[2.5 * cm],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(color)),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ROUNDEDCORNERS", [4, 4, 4, 4]),
        ]),
    )


class HeaderFooter:
    def __init__(self, title):
        self.title = title

    def __call__(self, canvas, doc):
        canvas.saveState()
        w, h = A4
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor(MUTED))
        canvas.drawString(2 * cm, h - 1.3 * cm, self.title)
        canvas.drawRightString(w - 2 * cm, h - 1.3 * cm, AUDIT_DATE)
        canvas.setStrokeColor(colors.HexColor(BORDER))
        canvas.line(2 * cm, h - 1.5 * cm, w - 2 * cm, h - 1.5 * cm)
        canvas.line(2 * cm, 1.5 * cm, w - 2 * cm, 1.5 * cm)
        canvas.drawCentredString(w / 2, 1.05 * cm, f"Página {doc.page}")
        canvas.restoreState()


def build_pdf():
    donut_path = make_donut()
    bars_path = make_bars()

    doc = BaseDocTemplate(OUT_PDF, pagesize=A4,
                           leftMargin=2 * cm, rightMargin=2 * cm,
                           topMargin=2 * cm, bottomMargin=2 * cm,
                           title=f"Relatório de Auditoria de Segurança — {PROJECT_NAME}")

    frame_cover = Frame(2 * cm, 2 * cm, A4[0] - 4 * cm, A4[1] - 4 * cm, id="cover")
    frame_body = Frame(2 * cm, 1.8 * cm, A4[0] - 4 * cm, A4[1] - 3.8 * cm, id="body")

    doc.addPageTemplates([
        PageTemplate(id="Cover", frames=[frame_cover]),
        PageTemplate(id="Body", frames=[frame_body],
                      onPage=HeaderFooter(f"Relatório de Auditoria de Segurança — {PROJECT_NAME}")),
    ])

    story = []

    # ---------------- CAPA ----------------
    story.append(Spacer(1, 3.5 * cm))
    story.append(Paragraph("Relatório de Auditoria de Segurança", styles["CoverTitle"]))
    story.append(Paragraph(f"— {PROJECT_NAME} —", styles["CoverSub"]))
    story.append(Spacer(1, 1.2 * cm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(BORDER)))
    story.append(Spacer(1, 0.6 * cm))

    meta_data = [
        ["Data da auditoria", AUDIT_DATE],
        ["Escopo", "Frontend (React/Vite/TS) + Backend Supabase\n"
                   "(Postgres/RLS + 19 Edge Functions Deno)\n"
                   "271 migrations · 68 tabelas ativas em public · 116 funções admin_*"],
        ["Metodologia", "5 categorias adaptadas à stack detectada:\n"
                         "1. Banco sem tranca → Row Level Security (RLS) do Postgres/Supabase\n"
                         "2. Permissão no navegador → gates de UI vs. checagem server-side (RPC "
                         "SECURITY DEFINER / Edge Function)\n"
                         "3. IDOR → posse de recurso validada por JWT em cada handler de Edge Function\n"
                         "4. Chaves expostas → grep de segredos em código, configs e histórico git\n"
                         "5. XSS → dangerouslySetInnerHTML/innerHTML, sanitização e templates de e-mail"],
    ]
    meta_table = Table(
        [[Paragraph(f"<b>{k}</b>", styles["Body"]), Paragraph(v.replace("\n", "<br/>"), styles["Body"])]
         for k, v in meta_data],
        colWidths=[3.6 * cm, 11.4 * cm],
    )
    meta_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, colors.HexColor(BORDER)),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 1.5 * cm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(BORDER)))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(
        "Nenhuma falha crítica foi identificada. A superfície auditada (RLS, permissões "
        "administrativas, posse de recursos, segredos e sanitização de entrada) mostra padrão "
        "defensivo consistente, incluindo evidências de hardening de uma auditoria de bug bounty "
        "anterior já incorporada ao código. Um achado de severidade alta foi identificado no modelo "
        "de confiança do webhook de pagamento.",
        styles["BodyMuted"]))

    story.append(NextPageTemplate("Body"))
    story.append(PageBreak())

    # ---------------- RESUMO EXECUTIVO ----------------
    story.append(Paragraph("Resumo Executivo", styles["H1"]))
    order, counts = sev_count()
    total_findings = sum(counts.values())
    total_strengths = len(STRENGTHS)

    summary_row = Table(
        [[Paragraph(f'<font size=18 color="{SEV_COLORS[s]}"><b>{counts[s]}</b></font><br/>'
                     f'<font size=8 color="{MUTED}">{s}</font>', styles["Body"]) for s in order]],
        colWidths=[3.34 * cm] * 5,
    )
    summary_row.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor(BORDER)),
        ("INNERGRID", (0, 0), (-1, -1), 0.6, colors.HexColor(BORDER)),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(summary_row)
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(
        f"<b>{total_findings}</b> achados no total (0 críticos) e <b>{total_strengths}</b> pontos "
        f"fortes verificados com evidência de código — a auditoria cobriu as 271 migrations e as "
        f"19 edge functions por completo, não por amostragem.",
        styles["BodyMuted"]))
    story.append(Spacer(1, 0.4 * cm))

    charts_table = Table(
        [[Image(donut_path, width=7.3 * cm, height=6.6 * cm),
          Image(bars_path, width=8.0 * cm, height=6.6 * cm)]],
        colWidths=[7.5 * cm, 8.3 * cm],
    )
    charts_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))
    story.append(charts_table)
    story.append(Spacer(1, 0.2 * cm))
    cap_row = Table([[Paragraph("Achados por severidade", styles["BodyMuted"]),
                       Paragraph("Achados por categoria", styles["BodyMuted"])]],
                     colWidths=[7.5 * cm, 8.3 * cm])
    cap_row.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER")]))
    story.append(cap_row)

    story.append(PageBreak())

    # ---------------- PONTOS FORTES / FRACOS ----------------
    story.append(Paragraph("Pontos Fortes", styles["H1"]))
    story.append(Paragraph(
        "O que foi verificado como protegido, com evidência direta no código — comprova a cobertura "
        "real da auditoria.", styles["BodyMuted"]))
    story.append(Spacer(1, 0.3 * cm))

    strength_rows = [[
        Paragraph("<b>Categoria</b>", styles["TableCellBold"]),
        Paragraph("<b>Evidência</b>", styles["TableCellBold"]),
        Paragraph("<b>Por que está correto</b>", styles["TableCellBold"]),
    ]]
    for cat, evid, why in STRENGTHS:
        strength_rows.append([
            Paragraph(cat, styles["TableCell"]),
            Paragraph(evid, styles["TableCell"]),
            Paragraph(why, styles["TableCell"]),
        ])
    strength_table = Table(strength_rows, colWidths=[3.0 * cm, 5.4 * cm, 8.1 * cm], repeatRows=1)
    strength_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(STRONG_COLOR)),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0FDF4")]),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor(BORDER)),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(strength_table)

    story.append(PageBreak())

    story.append(Paragraph("Pontos Fracos — Riscos Centrais", styles["H1"]))
    risk_summary = [
        ("Alta", "Webhook de pagamento (AbacatePay) confia só em secret de query string, sem "
                 "verificação HMAC do payload — limitação documentada do provedor, não bug de "
                 "implementação."),
        ("Baixa", "RPC has_role() aceita _user_id arbitrário, permitindo enumerar quais contas são "
                   "admin (sem escalar privilégio)."),
        ("Baixa", "Campo social_link (só editável por admin) renderizado em href sem validar esquema "
                   "— self-XSS de baixo impacto."),
    ]
    for sev, desc in risk_summary:
        row = Table([[sev_chip(sev), Paragraph(desc, styles["Body"])]],
                     colWidths=[2.7 * cm, 13.3 * cm])
        row.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))
        story.append(row)
        story.append(Spacer(1, 0.25 * cm))

    story.append(PageBreak())

    # ---------------- ACHADOS DETALHADOS ----------------
    story.append(Paragraph("Achados Detalhados", styles["H1"]))
    for f in FINDINGS:
        block = []
        header = Table(
            [[sev_chip(f["severidade"]),
              Paragraph(f'<b>{f["id"]} · {f["categoria"]}</b>', styles["TableCellBold"])]],
            colWidths=[2.7 * cm, 13.3 * cm],
        )
        header.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))
        block.append(header)
        block.append(Spacer(1, 0.15 * cm))
        block.append(Paragraph(f'<b>{f["titulo"]}</b>', styles["Body"]))
        block.append(Paragraph(f'<font color="{MUTED}">{f["arquivo"]}:{f["linhas"]}</font>',
                                styles["BodyMuted"]))
        block.append(Spacer(1, 0.15 * cm))
        code_escaped = (f["trecho"].replace("&", "&amp;").replace("<", "&lt;")
                        .replace(">", "&gt;").replace("\n", "<br/>"))
        block.append(Paragraph(code_escaped, styles["Mono"]))
        block.append(Spacer(1, 0.15 * cm))
        block.append(Paragraph(f'<b>Descrição:</b> {f["descricao"]}', styles["Body"]))
        block.append(Paragraph(f'<b>Por que é explorável:</b> {f["exploracao"]}', styles["Body"]))
        block.append(Paragraph(f'<b>Condições:</b> {f["condicoes"]}', styles["Body"]))
        block.append(Spacer(1, 0.5 * cm))
        story.append(KeepTogether(block))

    story.append(PageBreak())

    # ---------------- RECOMENDAÇÕES ----------------
    story.append(Paragraph("Recomendações Priorizadas", styles["H1"]))
    rec_rows = [[Paragraph("<b>Prior.</b>", styles["TableCellBold"]),
                 Paragraph("<b>Ação</b>", styles["TableCellBold"]),
                 Paragraph("<b>Como fazer</b>", styles["TableCellBold"])]]
    for p, action, how in RECOMMENDATIONS:
        rec_rows.append([Paragraph(f"<b>{p}</b>", styles["TableCell"]),
                          Paragraph(action, styles["TableCell"]),
                          Paragraph(how, styles["TableCell"])])
    rec_table = Table(rec_rows, colWidths=[1.6 * cm, 5.4 * cm, 9.5 * cm], repeatRows=1)
    rec_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(INK)),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor(BORDER)),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(rec_table)

    story.append(PageBreak())

    # ---------------- ISSUES PARA O GITHUB ----------------
    story.append(Paragraph("Issues para o GitHub", styles["H1"]))
    story.append(Paragraph(
        "Texto completo em Markdown, pronto para copiar e colar na criação de issues.",
        styles["BodyMuted"]))
    story.append(Spacer(1, 0.3 * cm))

    issues_md = build_issues_markdown()
    for i, issue_text in enumerate(issues_md, start=1):
        story.append(Paragraph(f"Issue {i}", styles["IssueTitle"]))
        escaped = (issue_text.replace("&", "&amp;").replace("<", "&lt;")
                   .replace(">", "&gt;").replace("\n", "<br/>"))
        story.append(Paragraph(escaped, styles["Mono"]))
        story.append(Spacer(1, 0.4 * cm))

    doc.build(story)
    return OUT_PDF


def build_issues_markdown():
    issues = []

    issues.append(f"""--- ISSUE 1 ---
### [Segurança] Webhook de pagamento AbacatePay depende só de secret em query string, sem verificação HMAC do payload

**Labels sugeridas:** `security`, `alta`

**Descrição do problema**
O endpoint `supabase/functions/abacate-webhook/index.ts` autentica requisições do provedor de pagamento
AbacatePay comparando um `webhookSecret` recebido via query string (`?webhookSecret=...`) contra um
segredo esperado, usando comparação em tempo constante. Não há verificação de assinatura HMAC do corpo
da requisição. O `userId` que ativa/revoga a assinatura paga vem do `external_id`/metadata do próprio
payload recebido, sem correlação com um registro pré-existente no lado do Plushify.

**Por que é explorável**
Um segredo em query string está mais sujeito a vazar em logs de proxy reverso, CDN, ou ferramentas de
observabilidade do que um segredo em header. Se o `webhookSecret` vazar, é possível forjar um POST para
ativar ou revogar o plano pago de qualquer `userId`, sem uma transação real ocorrida na AbacatePay.

**Evidência**
`supabase/functions/abacate-webhook/index.ts:132-321`
```ts
const receivedSecret = url.searchParams.get('webhookSecret')
if (!receivedSecret || !secretsMatch(receivedSecret, expectedSecret)) {{ ...401 }}
...
let parsed = parseExternalId(externalId) // "plushify:<userId>:<planType>:<billingPeriod>:<uuid>"
await admin.rpc('start_subscription', {{ p_user_id: userId, p_plan_code: planType, ... }})
```

**Impacto**
Ativação ou revogação fraudulenta de assinatura paga para qualquer usuário, caso o segredo do webhook
vaze. Não há evidência de vazamento nesta auditoria — o risco é estrutural do modelo de confiança.

**Sugestão de correção**
- Verificar se a AbacatePay suporta assinatura HMAC do payload e implementar essa verificação
  adicionalmente ao secret.
- Mover o secret para um header de requisição em vez de query string.
- Adicionar checagem de idempotência/replay por identificador único do evento já processado.
- Rotacionar o `webhookSecret` atual por precaução.

**Critérios de aceite**
- [ ] Verificação de assinatura de payload implementada (HMAC ou equivalente suportado pelo provedor)
- [ ] Secret movido de query string para header
- [ ] Checagem de replay/idempotência por ID de evento adicionada
- [ ] `webhookSecret` rotacionado em produção
- [ ] Teste automatizado cobrindo rejeição de payload com assinatura inválida
--- FIM ISSUE 1 ---""")

    issues.append(f"""--- ISSUE 2 ---
### [Segurança] RPC has_role() permite enumerar quais usuários são admin

**Labels sugeridas:** `security`, `baixa`

**Descrição do problema**
A função `has_role(uuid, app_role)` é `SECURITY DEFINER` e aceita um `_user_id` livre, sem forçar
`auth.uid()`. Qualquer usuário autenticado pode chamar `supabase.rpc('has_role', {{ _user_id: '<uuid de
outro usuário>', _role: 'admin' }})` e descobrir se aquele UUID tem papel de administrador.

**Por que é explorável**
Não escala privilégio por si só — todas as 116 RPCs `admin_*` sempre usam
`has_role(auth.uid(), 'admin')`, nunca um valor vindo do cliente. Mas permite enumerar quais contas
são administradoras da plataforma, útil para preparar ataques de phishing/engenharia social
direcionados a essas contas específicas.

**Evidência**
`supabase/migrations/20251005144801_*.sql:30-43` (definição) e
`supabase/migrations/20260728030000_admin_dashboard_foundation.sql:52-55` (grant)
```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
-- has_role() não força _user_id = auth.uid()
```

**Impacto**
Enumeração de contas administrativas por qualquer usuário autenticado — informação útil para
engenharia social/phishing direcionado, sem escalar privilégio diretamente.

**Sugestão de correção**
Criar uma RPC pública separada (ex: `has_role_self(app_role)`) que ignora qualquer parâmetro de ID e
sempre usa `auth.uid()` internamente; restringir `has_role(uuid, app_role)` para ser chamável apenas
por RPCs internas/server-side (revogar `EXECUTE` de `authenticated` na assinatura com `_user_id` livre).

**Critérios de aceite**
- [ ] Nova RPC `has_role_self()` criada e usada pelo frontend (useIsAdmin) em vez da versão irrestrita
- [ ] `EXECUTE` de `has_role(uuid, app_role)` revogado de `authenticated`/`anon`
- [ ] Todas as chamadas internas (RPCs admin_*) continuam funcionando sem alteração de comportamento
- [ ] Teste confirmando que um usuário não-admin não consegue mais consultar o papel de outro UUID
--- FIM ISSUE 2 ---""")

    issues.append(f"""--- ISSUE 3 ---
### [Segurança] Campo social_link renderizado em href sem validar esquema (self-XSS) + hardening geral de defesa em profundidade

**Labels sugeridas:** `security`, `baixa`

**Descrição do problema**
Esta issue agrupa dois achados triviais relacionados a sanitização de saída, de baixo risco individual:

1. `src/components/admin/prospects/ProspectDetailDialog.tsx:179` renderiza `prospect.social_link`
   (campo de texto livre, editável só por admins) direto em um atributo `href`, sem validar o esquema
   da URL. Um admin poderia gravar `javascript:...` no próprio campo e executá-lo na própria sessão.
2. `src/main.tsx:71-78` interpola `e.message` cru via `innerHTML` no handler de erro fatal global.
   Nenhum caminho de exploração foi identificado (a mensagem não é alimentada por input de usuário em
   nenhum fluxo mapeado), mas o padrão é frágil por natureza.

**Por que é explorável**
(1) é self-XSS — exige que o próprio admin insira e clique numa URL maliciosa; não afeta outros
usuários. (2) hoje não tem caminho de exploração conhecido; é hardening preventivo.

**Evidência**
```tsx
// src/components/admin/prospects/ProspectDetailDialog.tsx:179
<a href={{prospect.social_link}} target="_blank" rel="noopener noreferrer">

// src/main.tsx:71-78
el.innerHTML = `... ${{e.message}} ...`
```

**Impacto**
Baixo em ambos os casos — nem um nem outro afeta usuários além do próprio autor da ação, no estado
atual do código.

**Sugestão de correção**
- Criar uma função utilitária `isSafeUrl(url)` que aceite apenas esquemas `http:`, `https:` e
  `mailto:`, e aplicá-la em todo `href`/`src` alimentado por campo de texto livre gravado via UI
  administrativa (começando por `social_link`).
- Trocar `innerHTML` por `textContent` no handler de erro fatal global em `src/main.tsx`.

**Critérios de aceite**
- [ ] `isSafeUrl()` criada e aplicada em `ProspectDetailDialog.tsx` (e outros pontos análogos, se
      existirem)
- [ ] `src/main.tsx` usa `textContent` em vez de `innerHTML` para a mensagem de erro
- [ ] Teste cobrindo rejeição de `javascript:` em `social_link`
--- FIM ISSUE 3 ---""")

    return issues


if __name__ == "__main__":
    out = build_pdf()
    print(f"PDF gerado em: {out}")
