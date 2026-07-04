import path from 'path';
import { readFileSync } from 'fs';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

export type PropostaLead = {
  company_name: string | null;
  contact_name: string | null;
};

export type PropostaBriefing = {
  perdeu_agendamento_desorganizacao: string | null;
  cliente_sem_registro: string | null;
  perde_cliente_falta_atendimento: string | null;
  sabe_metricas_mes: string | null;
};

export type PropostaPrecificacao = {
  estrategia_cobranca: 'somente_setup' | 'somente_recorrencia' | 'setup_mais_recorrencia' | null;
  setup_valor_final: number | null;
  recorrencia_valor_final: number | null;
  observacoes_precificacao: string | null;
};

export type PropostaData = {
  lead: PropostaLead;
  briefing: PropostaBriefing;
  precificacao: PropostaPrecificacao;
};

export function formatBRL(value: number | null): string {
  if (value == null) return '—';
  const fixed = value.toFixed(2);
  const [intPart, centavos] = fixed.split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${withThousands},${centavos}`;
}

// @react-pdf/renderer 4.5.1 resolve `src` de string (caminho cru ou `file://`) de forma
// quebrada no Windows — testado empiricamente: caminho cru vira "fetch failed" e
// `file://` vira ENOENT (ele gruda process.cwd() na frente da própria URL). Ler o
// arquivo direto e passar `{ data, format }` bypassa esse resolvedor por completo.
function localAsset(relativePath: string): { data: Buffer; format: 'png' } {
  return { data: readFileSync(path.join(process.cwd(), relativePath)), format: 'png' };
}

const LOGO_PATH = localAsset('public/images/logo-csp-nexora.png');
const FUNDO_CAPA = localAsset('public/images/pdf/fundo-capa.png');
const FUNDO_CONTEUDO = localAsset('public/images/pdf/fundo-conteudo.png');
const FUNDO_INVESTIMENTO = localAsset('public/images/pdf/fundo-investimento.png');

const colors = {
  navy: '#060B24',
  orange: '#F5821F',
  white: '#FFFFFF',
  lightGray: '#E5E5E5', // texto secundário sobre fundo escuro
  bodyGray: '#6B7280', // texto secundário/corpo sobre fundo branco (ajuste de legibilidade, fora da paleta oficial)
  cardBg: '#F7F8FA', // fundo de card claro
  cardBorder: '#EAEAEA', // borda de card claro
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white, // fallback caso a imagem de fundo não carregue
    color: colors.navy,
    fontFamily: 'Helvetica',
    // Sem padding aqui de propósito — padding no <Page> encolhe a content box usada
    // como base do width/height:100% dos filhos absolutos (fundo full-bleed), deixando
    // sobra em branco (confirmado: filho absoluto ficava 96pt mais baixo, exatamente
    // 2x o padding). O espaçamento do conteúdo fica no wrapper `content` abaixo.
  },
  content: {
    padding: 48,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  contentColumn: {
    width: '58%', // mantém o texto longe da faixa decorativa do lado direito das artes
  },
  eyebrow: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.orange,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 11,
    color: colors.bodyGray,
    lineHeight: 1.6,
    marginBottom: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletDot: {
    width: 14,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.orange,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    color: colors.bodyGray,
    lineHeight: 1.5,
  },
  cardLight: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardLightLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.bodyGray,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cardInvestment: {
    backgroundColor: colors.navy,
    borderRadius: 10,
    padding: 20,
  },
  cardInvestmentLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  cardInvestmentValue: {
    fontSize: 34,
    fontFamily: 'Helvetica-Bold',
    color: colors.orange,
  },
  coverTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: colors.navy,
    textAlign: 'center',
  },
  coverCompany: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: colors.orange,
    textAlign: 'center',
    marginTop: 12,
  },
  footerCover: {
    position: 'absolute',
    bottom: 32,
    left: 48,
    right: 48,
    textAlign: 'center',
    fontSize: 9,
    color: colors.bodyGray,
  },
  footerContent: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLogo: {
    width: 20,
    height: 20,
  },
  footerPageNumber: {
    fontSize: 8,
    color: colors.lightGray,
  },
});

type LocalAsset = { data: Buffer; format: 'png' };

function Slide({
  children,
  index,
  variant = 'content',
  background = FUNDO_CONTEUDO,
}: {
  children: React.ReactNode;
  index: number;
  variant?: 'cover' | 'content';
  background?: LocalAsset;
}) {
  if (variant === 'cover') {
    return (
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Image src={background} style={styles.bgImage} fixed />
        <View style={[styles.content, { flex: 1 }]}>{children}</View>
        <View style={styles.footerCover} fixed>
          <Text>cspnexora.com.br</Text>
        </View>
      </Page>
    );
  }

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Image src={background} style={styles.bgImage} fixed />
      <View style={styles.content}>{children}</View>
      <View style={styles.footerContent} fixed>
        <Image src={LOGO_PATH} style={styles.footerLogo} />
        <Text style={styles.footerPageNumber}>{String(index).padStart(2, '0')} / 11</Text>
      </View>
    </Page>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const O_QUE_ESTA_INCLUSO = [
  'Secretaria de IA no WhatsApp — atendimento 24h, resposta em até 2 minutos',
  'Follow-up automatizado — 3 tentativas de retorno para leads sem resposta',
  'Painel de atendimento (CRM) para organizar todas as conversas',
  'Painel de gestão com métricas e Kanban em tempo real',
  'Agendamento automatizado integrado à IA, com confirmações automáticas',
  'Suporte contínuo e grupo de WhatsApp exclusivo',
];

export function PropostaDocument({ lead, briefing, precificacao }: PropostaData) {
  const cenarioBullets = [
    briefing.perdeu_agendamento_desorganizacao,
    briefing.cliente_sem_registro,
    briefing.perde_cliente_falta_atendimento,
    briefing.sabe_metricas_mes,
  ].filter((v): v is string => !!v && v.trim() !== '');

  const mostrarSetup =
    precificacao.estrategia_cobranca === 'somente_setup' ||
    precificacao.estrategia_cobranca === 'setup_mais_recorrencia';
  const mostrarRecorrencia =
    precificacao.estrategia_cobranca === 'somente_recorrencia' ||
    precificacao.estrategia_cobranca === 'setup_mais_recorrencia';

  return (
    <Document>
      {/* Slide 1 - Capa */}
      <Slide index={1} variant="cover" background={FUNDO_CAPA}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.coverTitle}>Proposta Comercial</Text>
          <Text style={styles.coverCompany}>
            {lead.company_name ?? 'Empresa não informada'}
          </Text>
        </View>
      </Slide>

      {/* Slide 2 - Cenário Atual (dinâmico) */}
      <Slide index={2}>
        <View style={styles.contentColumn}>
          <Text style={styles.eyebrow}>Diagnóstico</Text>
          <Text style={[styles.title, { color: colors.navy }]}>Cenário Atual</Text>
          {cenarioBullets.length > 0 ? (
            cenarioBullets.map((texto, i) => <Bullet key={i} text={texto} />)
          ) : (
            <Text style={styles.paragraph}>
              Nenhuma informação de cenário registrada no briefing.
            </Text>
          )}
        </View>
      </Slide>

      {/* Slide 3 - Como Vamos Ajudar */}
      <Slide index={3}>
        <View style={styles.contentColumn}>
          <Text style={styles.eyebrow}>A Solução</Text>
          <Text style={[styles.title, { color: colors.navy }]}>Como Vamos Ajudar</Text>
          <Text style={styles.paragraph}>
            Este slide apresenta o sistema como um todo antes de entrar em qualquer detalhe.
            O lead precisa entender que não está comprando uma ferramenta isolada — está
            adquirindo um ecossistema completo onde cada módulo se conecta e trabalha junto
            para transformar a operação do negócio. É aqui que o tamanho da solução justifica
            o tamanho do investimento.
          </Text>
          <Text style={styles.paragraph}>
            Imagine um negócio que hoje depende de uma atendente para responder WhatsApp,
            outro caderno para anotar agendamentos e uma planilha para tentar controlar os leads.
          </Text>
          <Text style={styles.paragraph}>
            Com o ecossistema completo, tudo isso passa a funcionar de forma integrada e
            automática — a Secretaria de IA atende, o CRM organiza, o painel mostra os
            números e a agenda gerencia os horários. Uma operação que antes dependia de
            três pessoas rodando em uma só.
          </Text>
        </View>
      </Slide>

      {/* Slide 4 - Secretaria de IA no WhatsApp */}
      <Slide index={4}>
        <View style={styles.contentColumn}>
          <Text style={styles.eyebrow}>Módulo 1</Text>
          <Text style={[styles.title, { color: colors.navy }]}>Secretaria de IA no WhatsApp</Text>
          <Bullet text="Atendimento 24 horas por dia, todos os dias da semana." />
          <Bullet text="Resposta em até 2 minutos para qualquer contato recebido." />
          <Bullet text="Nunca deixa um lead ou cliente sem resposta, mesmo fora do horário comercial." />
          <Bullet text="Faz a triagem e qualificação inicial de cada conversa antes de encaminhar." />
        </View>
      </Slide>

      {/* Slide 5 - Follow-up Automatizado */}
      <Slide index={5}>
        <View style={styles.contentColumn}>
          <Text style={styles.eyebrow}>Módulo 2</Text>
          <Text style={[styles.title, { color: colors.navy }]}>Follow-up Automatizado</Text>
          <Text style={styles.paragraph}>
            Leads que não respondem de primeira não são perdidos. O sistema retoma o
            contato automaticamente em até 3 tentativas, em intervalos estratégicos,
            aumentando a taxa de conversão sem depender de alguém lembrar de retornar
            manualmente.
          </Text>
        </View>
      </Slide>

      {/* Slide 6 - CRM de WhatsApp (nunca mencionar Chatwoot) */}
      <Slide index={6}>
        <View style={styles.contentColumn}>
          <Text style={styles.eyebrow}>Módulo 3</Text>
          <Text style={[styles.title, { color: colors.navy }]}>CRM de WhatsApp</Text>
          <Text style={styles.paragraph}>
            Todas as conversas ficam centralizadas em um painel de atendimento único,
            organizado por status e responsável. Nenhuma mensagem se perde em conversas
            espalhadas — a ferramenta de CRM dá visibilidade completa do funil de
            atendimento em tempo real.
          </Text>
        </View>
      </Slide>

      {/* Slide 7 - Painel de Gestão */}
      <Slide index={7}>
        <View style={styles.contentColumn}>
          <Text style={styles.eyebrow}>Módulo 4</Text>
          <Text style={[styles.title, { color: colors.navy }]}>Painel de Gestão</Text>
          <Bullet text="Dashboard em tempo real com a visão geral da operação." />
          <Bullet text="Kanban visual para acompanhar cada etapa do atendimento." />
          <Bullet text="Métricas de conversão para entender o que está funcionando." />
          <Bullet text="Filtros por período para comparar resultados ao longo do tempo." />
        </View>
      </Slide>

      {/* Slide 8 - Agendamento Automatizado */}
      <Slide index={8}>
        <View style={styles.contentColumn}>
          <Text style={styles.eyebrow}>Módulo 5</Text>
          <Text style={[styles.title, { color: colors.navy }]}>Agendamento Automatizado</Text>
          <Bullet text="Integração direta com a IA de atendimento — o próprio agendamento acontece na conversa." />
          <Bullet text="Confirmações automáticas para reduzir faltas e reagendamentos de última hora." />
          <Bullet text="Zero vai-e-vem manual entre cliente e equipe para marcar um horário." />
        </View>
      </Slide>

      {/* Slide 9 - Suporte Contínuo */}
      <Slide index={9}>
        <View style={styles.contentColumn}>
          <Text style={styles.eyebrow}>Módulo 6</Text>
          <Text style={[styles.title, { color: colors.navy }]}>Suporte Contínuo</Text>
          <Bullet text="Ajustes pontuais no sistema conforme a operação evolui." />
          <Bullet text="Manutenção contínua para garantir que tudo continue funcionando." />
          <Bullet text="Grupo de WhatsApp exclusivo para suporte direto com a equipe CSP Nexora." />
        </View>
      </Slide>

      {/* Slide 10 - Prazo de Entrega */}
      <Slide index={10}>
        <View style={styles.contentColumn}>
          <Text style={styles.eyebrow}>Cronograma</Text>
          <Text style={[styles.title, { color: colors.navy }]}>Prazo de Entrega</Text>
          <View style={styles.cardLight}>
            <Text style={styles.cardLightLabel}>Etapas</Text>
            <Bullet text="3 dias — coleta de dados e briefing" />
            <Bullet text="3 dias — criação e configuração do sistema" />
            <Bullet text="7 dias — treinamento da IA" />
            <Bullet text="7 dias — testes e ajustes finais" />
          </View>
          <Text style={styles.paragraph}>Prazo total estimado: 20 dias corridos.</Text>
        </View>
      </Slide>

      {/* Slide 11 - Investimento (dinâmico) */}
      <Slide index={11} background={FUNDO_INVESTIMENTO}>
        <View style={styles.contentColumn}>
          <Text style={styles.eyebrow}>Proposta</Text>
          <Text style={[styles.title, { color: colors.navy }]}>Investimento</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          {mostrarSetup && (
            <View style={[styles.cardInvestment, { flex: 1 }]}>
              <Text style={styles.cardInvestmentLabel}>Setup (implantação)</Text>
              <Text style={styles.cardInvestmentValue}>{formatBRL(precificacao.setup_valor_final)}</Text>
            </View>
          )}
          {mostrarRecorrencia && (
            <View style={[styles.cardInvestment, { flex: 1 }]}>
              <Text style={styles.cardInvestmentLabel}>Recorrência mensal</Text>
              <Text style={styles.cardInvestmentValue}>{formatBRL(precificacao.recorrencia_valor_final)}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardLight}>
          <Text style={styles.cardLightLabel}>O que está incluso</Text>
          {O_QUE_ESTA_INCLUSO.map((item, i) => (
            <Bullet key={i} text={item} />
          ))}
        </View>

        {precificacao.observacoes_precificacao?.trim() && (
          <View style={styles.cardLight}>
            <Text style={styles.cardLightLabel}>Condições especiais</Text>
            <Text style={styles.paragraph}>{precificacao.observacoes_precificacao}</Text>
          </View>
        )}
      </Slide>
    </Document>
  );
}
