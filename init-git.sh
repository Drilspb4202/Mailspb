#!/bin/bash
# Скрипт для инициализации Git репозитория
# Использование: chmod +x init-git.sh && ./init-git.sh

echo "🚀 Инициализация Git репозитория..."

# Инициализация Git
git init

# Проверка .gitignore
if [ -f ".gitignore" ]; then
    echo "✅ .gitignore найден"
else
    echo "❌ .gitignore не найден!"
    exit 1
fi

# Проверка что config.js исключен
if grep -q "js/config.js" .gitignore; then
    echo "✅ config.js в .gitignore"
else
    echo "⚠️ config.js НЕ в .gitignore! Добавляю..."
    echo -e "\njs/config.js" >> .gitignore
fi

# Добавить все файлы
echo "📦 Добавление файлов..."
git add .

# Показать статус
echo -e "\n📊 Статус:"
git status

# Первый коммит
echo -e "\n💾 Создание первого коммита..."
git commit -m "Initial commit: MailSlurp временная почта с генератором данных"

echo -e "\n✅ Git репозиторий инициализирован!"
echo -e "\nСледующие шаги:"
echo "1. Создайте репозиторий на GitHub"
echo "2. Выполните команды:"
echo "   git remote add origin https://github.com/ВАШ_USERNAME/ВАШ_РЕПОЗИТОРИЙ.git"
echo "   git branch -M main"
echo "   git push -u origin main"

