# ============================================================
# update-docs.ps1 — CSP Nexora
# Atualiza a documentação do projeto e faz commit no GitHub
# Uso manual: clique direito → "Executar com PowerShell"
# Automático: Task Scheduler às 20h
# ============================================================

$PROJECT_PATH = "C:\Users\clads\projetos\CSP-Nexora"
$DOCS_PATH = "$PROJECT_PATH\docs"
$LOG_FILE = "$PROJECT_PATH\docs\update-docs.log"
$DATE = Get-Date -Format "yyyy-MM-dd HH:mm"

Write-Host ""
Write-Host "🔄 Iniciando atualização da documentação..." -ForegroundColor Cyan
Write-Host "📁 Projeto: $PROJECT_PATH"
Write-Host ""

# Entrar na pasta do projeto
Set-Location $PROJECT_PATH

# Verificar se o Git está ok
$gitStatus = git status --short 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro: Git não encontrado ou repositório inválido." -ForegroundColor Red
    exit 1
}

# Verificar se há alterações para commitar
if (-not $gitStatus) {
    Write-Host "✅ Nenhuma alteração detectada. Documentação já está atualizada." -ForegroundColor Green
    Add-Content $LOG_FILE "[$DATE] Sem alterações."
    exit 0
}

# Mostrar o que mudou
Write-Host "📝 Alterações detectadas:" -ForegroundColor Yellow
Write-Host $gitStatus
Write-Host ""

# Fazer o commit
$COMMIT_MSG = "docs: atualização automática $DATE"
git add .
git commit -m $COMMIT_MSG
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Documentação atualizada e enviada para o GitHub!" -ForegroundColor Green
    Write-Host "💾 Commit: $COMMIT_MSG"
    Add-Content $LOG_FILE "[$DATE] Commit realizado: $COMMIT_MSG"
} else {
    Write-Host ""
    Write-Host "❌ Erro ao fazer push. Verifique sua conexão ou credenciais do Git." -ForegroundColor Red
    Add-Content $LOG_FILE "[$DATE] ERRO no push."
}

Write-Host ""
