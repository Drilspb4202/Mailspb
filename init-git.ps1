# Скрипт для инициализации Git репозитория
# Выполните этот скрипт из папки проекта

Write-Host "🚀 Инициализация Git репозитория..." -ForegroundColor Cyan

# Инициализация Git
git init

# Проверка .gitignore
if (Test-Path ".gitignore") {
    Write-Host "✅ .gitignore найден" -ForegroundColor Green
} else {
    Write-Host "❌ .gitignore не найден!" -ForegroundColor Red
    exit 1
}

# Проверка что config.js исключен
$gitignoreContent = Get-Content ".gitignore"
if ($gitignoreContent -match "js/config.js") {
    Write-Host "✅ config.js в .gitignore" -ForegroundColor Green
} else {
    Write-Host "⚠️ config.js НЕ в .gitignore! Добавляю..." -ForegroundColor Yellow
    Add-Content ".gitignore" "`njs/config.js"
}

# Добавить все файлы
Write-Host "📦 Добавление файлов..." -ForegroundColor Cyan
git add .

# Показать статус
Write-Host "`n📊 Статус:" -ForegroundColor Cyan
git status

# Первый коммит
Write-Host "`n💾 Создание первого коммита..." -ForegroundColor Cyan
git commit -m "Initial commit: MailSlurp временная почта с генератором данных"

Write-Host "`n✅ Git репозиторий инициализирован!" -ForegroundColor Green
Write-Host "`nСледующие шаги:" -ForegroundColor Yellow
Write-Host "1. Создайте репозиторий на GitHub" -ForegroundColor White
Write-Host "2. Выполните команды:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/ВАШ_USERNAME/ВАШ_РЕПОЗИТОРИЙ.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray

