# ============================================================
# setup-scheduler.ps1 — CSP Nexora
# Registra o update-docs.ps1 no Task Scheduler do Windows
# EXECUTE ESTE ARQUIVO UMA ÚNICA VEZ como Administrador
# ============================================================

$TASK_NAME = "CSP-Nexora-UpdateDocs"
$SCRIPT_PATH = "C:\Users\clads\projetos\CSP-Nexora\update-docs.ps1"
$HORA = "20:00"

Write-Host ""
Write-Host "⚙️  Configurando agendamento automático..." -ForegroundColor Cyan

# Criar a ação (executar o script PowerShell)
$Action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$SCRIPT_PATH`""

# Criar o gatilho (todo dia às 20h)
$Trigger = New-ScheduledTaskTrigger -Daily -At $HORA

# Configurações da tarefa
$Settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 5) `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

# Registrar no Task Scheduler
Register-ScheduledTask `
    -TaskName $TASK_NAME `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Description "Atualiza documentação da CSP Nexora e faz commit no GitHub" `
    -Force

if ($LASTEXITCODE -eq 0 -or $?) {
    Write-Host ""
    Write-Host "✅ Agendamento criado com sucesso!" -ForegroundColor Green
    Write-Host "🕗 Vai rodar todo dia às $HORA automaticamente"
    Write-Host "📋 Nome da tarefa: $TASK_NAME"
    Write-Host ""
    Write-Host "Para verificar: abra o 'Agendador de Tarefas' do Windows e procure '$TASK_NAME'"
} else {
    Write-Host ""
    Write-Host "❌ Erro ao criar agendamento." -ForegroundColor Red
    Write-Host "Tente executar este script como Administrador." -ForegroundColor Yellow
}

Write-Host ""
