/**
 * Exporta os workflows do n8n do projeto CSP Nexora para JSON versionados neste diretório.
 *
 * Quando rodar: depois de um conjunto de mudanças "prontas" e testadas no n8n
 * (ex: workflow novo publicado, bug corrigido e validado) — NÃO a cada save/rascunho,
 * para não poluir o histórico do git com estados intermediários de edição.
 *
 * Requisito: variável N8N_API_KEY definida em .env.local (raiz do projeto), com
 * permissão de leitura na API do n8n (gerada em Settings > n8n API).
 *
 * Uso: node n8n-workflows/export.js
 */

const fs = require('fs');
const path = require('path');

const N8N_URL = 'https://csp-nexora-n8n.4baehj.easypanel.host';
const ROOT_DIR = path.join(__dirname, '..');
const OUT_DIR = __dirname;
const ENV_FILE = path.join(ROOT_DIR, '.env.local');
const EXCLUDE_NAME_SUBSTR = 'ellegance';

function loadEnvVar(filePath, key) {
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx).trim();
    if (k !== key) continue;
    let v = trimmed.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    return v;
  }
  return null;
}

function sanitizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function n8nFetch(apiKey, urlPath) {
  const res = await fetch(`${N8N_URL}${urlPath}`, {
    headers: { 'X-N8N-API-KEY': apiKey },
  });
  if (!res.ok) {
    throw new Error(`n8n API ${urlPath} -> HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchAllWorkflows(apiKey) {
  let all = [];
  let cursor = null;
  do {
    const qs = cursor ? `?limit=250&cursor=${encodeURIComponent(cursor)}` : '?limit=250';
    const page = await n8nFetch(apiKey, `/api/v1/workflows${qs}`);
    all = all.concat(page.data || []);
    cursor = page.nextCursor || null;
  } while (cursor);
  return all;
}

// Heurística para achar valores de credencial hardcoded (não apenas referências
// por ID) dentro dos parâmetros dos nodes exportados.
const SUSPECT_KEY_RE = /token|apikey|api_key|secret|password|senha|authorization/i;
const JWT_RE = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function isExpressionOrEmpty(v) {
  const t = v.trim();
  return t === '' || t.startsWith('={{') || t.startsWith('{{');
}

function maskValue(v) {
  if (v.length <= 12) return '*'.repeat(v.length);
  return `${v.slice(0, 6)}...${v.slice(-4)}`;
}

function scanForSecrets(obj, filePath, pathTrail, findings) {
  if (obj === null || obj === undefined || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => scanForSecrets(item, filePath, `${pathTrail}[${i}]`, findings));
    return;
  }

  // Padrão comum no n8n: { name: "token", value: "..." } em headerParameters,
  // queryParameters, bodyParameters etc. A checagem por chave direta não pega
  // esse caso porque o valor sensível fica sob a chave genérica "value".
  if (typeof obj.name === 'string' && typeof obj.value === 'string' && SUSPECT_KEY_RE.test(obj.name) && !isExpressionOrEmpty(obj.value)) {
    findings.push({
      file: filePath,
      path: `${pathTrail}.value`,
      reason: `par name/value com name="${obj.name}"`,
      preview: maskValue(obj.value),
    });
  }

  for (const [k, v] of Object.entries(obj)) {
    const currentPath = pathTrail ? `${pathTrail}.${k}` : k;
    if (typeof v === 'string') {
      if (JWT_RE.test(v.trim())) {
        findings.push({ file: filePath, path: currentPath, reason: 'valor parece um JWT', preview: maskValue(v) });
      } else if (SUSPECT_KEY_RE.test(k) && !isExpressionOrEmpty(v)) {
        findings.push({ file: filePath, path: currentPath, reason: `chave sugere credencial ("${k}")`, preview: maskValue(v) });
      }
    } else {
      scanForSecrets(v, filePath, currentPath, findings);
    }
  }
}

async function main() {
  const apiKey = loadEnvVar(ENV_FILE, 'N8N_API_KEY');
  if (!apiKey) {
    console.error('N8N_API_KEY não encontrada em .env.local — abortando.');
    process.exit(1);
  }

  console.log('Buscando lista de workflows...');
  const workflows = await fetchAllWorkflows(apiKey);
  console.log(`Total encontrado: ${workflows.length}`);

  const included = workflows.filter((w) => !w.name.toLowerCase().includes(EXCLUDE_NAME_SUBSTR));
  const excluded = workflows.filter((w) => w.name.toLowerCase().includes(EXCLUDE_NAME_SUBSTR));

  if (excluded.length > 0) {
    console.log(`\nExcluídos por nome conter "Ellegance" (${excluded.length}):`);
    excluded.forEach((w) => console.log(`  - ${w.name}`));
  }

  const createdFiles = [];
  console.log(`\nExportando ${included.length} workflows...`);
  for (const wf of included) {
    const full = await n8nFetch(apiKey, `/api/v1/workflows/${wf.id}`);
    const fileName = `${sanitizeName(full.name)}.json`;
    const filePath = path.join(OUT_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(full, null, 2) + '\n', 'utf8');
    createdFiles.push(fileName);
    console.log(`  salvo: ${fileName}`);
  }

  console.log('\n--- Varredura por credenciais hardcoded nos JSONs gerados ---');
  const findings = [];
  for (const fileName of createdFiles) {
    const filePath = path.join(OUT_DIR, fileName);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    scanForSecrets(data, fileName, '', findings);
  }

  if (findings.length > 0) {
    console.log(`\n⚠️  ${findings.length} possível(is) credencial(is) encontrada(s) — NÃO COMMITAR sem revisar:`);
    findings.forEach((f) => {
      console.log(`  [${f.file}] ${f.path} — ${f.reason} — valor: ${f.preview}`);
    });
  } else {
    console.log('\nNenhuma credencial hardcoded aparente encontrada.');
  }

  console.log('\n=== Arquivos criados/atualizados ===');
  createdFiles.forEach((f) => console.log(`  n8n-workflows/${f}`));
}

main().catch((err) => {
  console.error('Erro:', err.message);
  process.exit(1);
});
