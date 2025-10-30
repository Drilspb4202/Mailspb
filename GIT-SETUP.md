# 🔧 Настройка Git и пуш на GitHub

## 📋 Пошаговая инструкция

### Шаг 1: Инициализация Git в папке проекта

Откройте терминал **В ПАПКЕ ПРОЕКТА** (там где лежит index.html) и выполните:

#### Windows (PowerShell)
```powershell
# Перейдите в папку проекта
cd "C:\Users\Miron\Desktop\Новая папка"

# Запустите скрипт инициализации
.\init-git.ps1

# Или вручную:
git init
git add .
git commit -m "Initial commit: MailSlurp app"
```

#### Linux/Mac (Bash)
```bash
# Перейдите в папку проекта
cd /path/to/your/project

# Сделайте скрипт исполняемым
chmod +x init-git.sh

# Запустите скрипт
./init-git.sh
```

### Шаг 2: Создание репозитория на GitHub

1. **Перейдите на GitHub:**
   - Откройте [github.com](https://github.com)
   - Войдите в аккаунт

2. **Создайте новый репозиторий:**
   - Нажмите **"+"** → **"New repository"**
   - Имя: `mailslurp-temp-mail` (или ваше)
   - Описание: `Временная почта с генератором данных`
   - Выберите: **Public** или **Private**
   - ❌ **НЕ** добавляйте README, .gitignore, license (уже есть!)
   - Нажмите **"Create repository"**

3. **Скопируйте URL репозитория:**
   ```
   https://github.com/ВАШ_USERNAME/mailslurp-temp-mail.git
   ```

### Шаг 3: Подключение и пуш

```bash
# Добавить удаленный репозиторий
git remote add origin https://github.com/ВАШ_USERNAME/mailslurp-temp-mail.git

# Переименовать ветку в main (если нужно)
git branch -M main

# Запушить код
git push -u origin main
```

### Шаг 4: Проверка

После пуша:
1. ✅ Обновите страницу GitHub
2. ✅ Проверьте что все файлы на месте
3. ❌ Убедитесь что `js/config.js` **НЕТ** в репозитории!

```bash
# Проверка локально:
git ls-files | grep config.js
# Должно быть пусто!
```

## 🔐 Безопасность: Проверка перед пушем

### ВАЖНО! Убедитесь что config.js НЕ попадет в Git:

```bash
# 1. Проверить .gitignore
cat .gitignore | grep config.js
# Должно быть: js/config.js

# 2. Проверить что файл игнорируется
git check-ignore js/config.js
# Должно вернуть: js/config.js

# 3. Проверить статус
git status
# config.js НЕ должен быть в списке!
```

## 🚨 Если случайно закоммитили config.js

```bash
# Удалить из последнего коммита
git rm --cached js/config.js
git commit --amend -m "Remove config.js"

# Если уже запушили - ОПАСНО!
git push --force

# НЕМЕДЛЕННО смените все API ключи!
```

## 📦 Структура репозитория

После пуша в GitHub будет:

```
mailslurp-temp-mail/
├── ✅ index.html
├── ✅ styles.css
├── ✅ js/
│   ├── ✅ app.js
│   ├── ✅ ui.js
│   ├── ✅ api.js
│   ├── ✅ i18n.js
│   ├── ✅ api-key-pool.js
│   ├── ✅ api-key-manager.js
│   ├── ✅ data-generator.js
│   ├── ✅ performance-optimizer.js
│   ├── ✅ config.example.js
│   └── ❌ config.js (НЕ должно быть!)
├── ✅ vercel.json
├── ✅ .vercelignore
├── ✅ .gitignore
├── ✅ README.md
├── ✅ DEPLOY.md
├── ✅ SECURITY.md
└── ✅ GIT-SETUP.md (этот файл)
```

## 🔄 Дальнейшие обновления

После первого пуша, для обновления кода:

```bash
# 1. Внести изменения в файлы

# 2. Проверить изменения
git status
git diff

# 3. Добавить изменения
git add .

# 4. Закоммитить
git commit -m "Описание изменений"

# 5. Запушить
git push
```

## 🌐 Автоматический деплой на Vercel

После пуша в GitHub:

1. **Подключите репозиторий к Vercel:**
   ```
   vercel.com → New Project → Import Git Repository
   ```

2. **Настройте автодеплой:**
   - Каждый `git push` → автоматический деплой
   - Pull Requests → preview деплой
   - Ветка `main` → production

3. **Готово!**
   - Vercel автоматически задеплоит
   - Получите URL: `https://ваш-проект.vercel.app`

## 🎯 Checklist

Перед пушем проверьте:
- [ ] Git инициализирован в папке проекта
- [ ] `.gitignore` содержит `js/config.js`
- [ ] `config.js` не в списке `git status`
- [ ] Все остальные файлы добавлены
- [ ] Первый коммит создан
- [ ] Репозиторий создан на GitHub
- [ ] Remote добавлен
- [ ] Код запушен

После пуша:
- [ ] Репозиторий открывается на GitHub
- [ ] Все файлы на месте
- [ ] `js/config.js` НЕТ в репозитории ✅
- [ ] README отображается корректно

## 💡 Полезные команды

```bash
# Посмотреть историю коммитов
git log --oneline

# Посмотреть изменения
git diff

# Отменить изменения в файле
git checkout -- filename

# Посмотреть удаленные репозитории
git remote -v

# Клонировать репозиторий (на другом компьютере)
git clone https://github.com/ВАШ_USERNAME/mailslurp-temp-mail.git
```

## 🆘 Помощь

### Ошибка: "fatal: not a git repository"
```bash
# Решение: Вы не в папке проекта
cd /path/to/project
git init
```

### Ошибка: "remote origin already exists"
```bash
# Решение: Удалите и добавьте заново
git remote remove origin
git remote add origin https://github.com/...
```

### Ошибка: "failed to push"
```bash
# Решение: Сначала подтяните изменения
git pull origin main --rebase
git push
```

## 🎉 Готово!

После успешного пуша:
1. ✅ Код в GitHub
2. ✅ Готов к деплою на Vercel
3. ✅ Другие могут клонировать и использовать
4. ✅ История изменений сохраняется

---

**Следующий шаг:** Разверните на Vercel - см. [DEPLOY.md](DEPLOY.md)

