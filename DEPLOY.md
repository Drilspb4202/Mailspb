# 🚀 Деплой на Vercel

## Быстрый старт

### 1. Установка Vercel CLI (опционально)

```bash
npm install -g vercel
```

### 2. Деплой через веб-интерфейс (рекомендуется)

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите **"New Project"**
3. Импортируйте ваш Git репозиторий
4. Vercel автоматически определит настройки
5. Нажмите **"Deploy"**

### 3. Деплой через CLI

```bash
# Войти в аккаунт
vercel login

# Деплой проекта
vercel

# Деплой в production
vercel --prod
```

## ⚙️ Настройка API ключей для Vercel

### ✅ Вариант 1: Environment Variables (рекомендуется - АВТОМАТИЧЕСКИЙ)

**Этот вариант автоматически создает `config.js` из переменных окружения при каждом деплое.**

1. В Vercel Dashboard откройте ваш проект
2. Перейдите в **Settings → Environment Variables**
3. Добавьте переменные одним из способов:

   **Способ A: Отдельные переменные (для каждого ключа)**
   ```
   API_KEY_1=ваш_первый_ключ
   API_KEY_2=ваш_второй_ключ
   API_KEY_3=ваш_третий_ключ
   ```

   **Способ B: Одна переменная со всеми ключами (через запятую)**
   ```
   API_KEYS=ключ1,ключ2,ключ3
   ```

4. Убедитесь, что переменные доступны для всех окружений:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. При деплое скрипт `build-config.js` автоматически создаст `js/config.js` из этих переменных

**Преимущества:**
- ✅ Ключи не хранятся в Git
- ✅ Безопасное хранение на Vercel
- ✅ Легко обновлять через Dashboard
- ✅ Разные ключи для разных окружений

### Вариант 2: Локальный config.js

1. Убедитесь, что `js/config.js` существует локально
2. При деплое через Vercel CLI файл будет включен
3. **ВАЖНО:** Не коммитьте config.js в Git!

```bash
# Проверьте .gitignore
cat .gitignore | grep config.js
# Должно быть: js/config.js
```

### Вариант 3: Добавление ключей через интерфейс приложения

После деплоя:
1. Откройте развернутое приложение
2. Перейдите в **Настройки**
3. Нажмите **"Добавить ключ"**
4. Введите ваши API ключи
5. Ключи сохранятся в localStorage браузера (только для текущего пользователя)

## 📝 Структура проекта для Vercel

```
project/
├── index.html          # Главная страница
├── styles.css          # Стили
├── js/
│   ├── config.js       # API ключи (не в Git!)
│   ├── app.js
│   ├── ui.js
│   ├── api.js
│   └── ...
├── vercel.json         # Конфигурация Vercel
├── .vercelignore       # Что не деплоить
└── README.md
```

## 🔧 Настройка vercel.json

Файл `vercel.json` уже настроен для:

✅ Статический хостинг  
✅ Кэширование JS и CSS  
✅ Заголовки безопасности  
✅ SPA routing  

## 🌐 Пользовательский домен

### Добавить домен в Vercel:

1. **Settings → Domains**
2. Введите ваш домен (например: `mymail.com`)
3. Следуйте инструкциям по настройке DNS

### Настройка DNS:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 🔒 Безопасность при деплое

### Перед деплоем проверьте:

```bash
# 1. config.js в .gitignore
git check-ignore js/config.js

# 2. Не закоммичены ключи
git log --all --full-history -- js/config.js

# 3. Файл не в репозитории
git ls-files | grep config.js
# Должно быть пусто!
```

### Если случайно закоммитили ключи:

```bash
# Удалить из истории
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch js/config.js" \
  --prune-empty --tag-name-filter cat -- --all

# Принудительный push
git push origin --force --all

# ВАЖНО: Смените все API ключи!
```

## 📊 Мониторинг

### Vercel Analytics (бесплатно)

1. Включите в **Settings → Analytics**
2. Отслеживайте:
   - Посещаемость
   - Производительность
   - Ошибки

### Логи

```bash
# Посмотреть логи последнего деплоя
vercel logs

# Логи production
vercel logs --prod
```

## 🚀 Автоматический деплой

### Настройка Git Integration:

1. Подключите GitHub/GitLab/Bitbucket
2. Каждый push в `main` → автоматический деплой
3. Pull requests → preview деплой

### Branch Protection:

- `main` → production
- `dev` → staging
- feature branches → preview URLs

## 🔄 Обновление приложения

```bash
# 1. Внести изменения
git add .
git commit -m "Update feature"

# 2. Push в репозиторий
git push origin main

# 3. Vercel автоматически задеплоит
# Или вручную:
vercel --prod
```

## 📱 Тестирование мобильной версии

После деплоя проверьте на:

- ✅ iPhone (Safari)
- ✅ Android (Chrome)
- ✅ Планшеты
- ✅ Разные ориентации

### Инструменты для тестирования:

```bash
# Chrome DevTools
F12 → Toggle Device Toolbar (Ctrl+Shift+M)

# BrowserStack
https://www.browserstack.com

# Vercel Preview
Автоматические preview URLs для PR
```

## 🐛 Устранение проблем

### Ошибка: "Все API ключи исчерпаны!" или "API ключи не найдены"

**Причина:** Файл `config.js` отсутствует или не содержит API ключей при деплое.

#### ✅ Решение 1: Используйте Environment Variables (рекомендуется)

1. Перейдите в **Vercel Dashboard → Settings → Environment Variables**
2. Добавьте переменные:
   - `API_KEY_1`, `API_KEY_2`, `API_KEY_3` (или `API_KEYS` со всеми ключами через запятую)
3. Перезапустите деплой - `config.js` создастся автоматически

#### Решение 2: Создать config.js локально (только для тестирования)

Если вы деплоите через Vercel CLI и хотите использовать локальный файл:

```bash
# 1. Создайте config.js локально
cp js/config.example.js js/config.js

# 2. Добавьте ваши API ключи в config.js
# Отредактируйте файл и добавьте ключи в массив ENCODED_API_KEYS
# Ключи должны быть закодированы в Base64
# 
# Пример кодирования в PowerShell:
# [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("ваш_ключ"))

# 3. Деплой через CLI (файл будет включен)
vercel --prod
```

**ВАЖНО:** При деплое через Git-интеграцию локальный `config.js` не попадет на сервер (он в `.gitignore`). Используйте Environment Variables!

**Как закодировать ключ в Base64:**

- **PowerShell (Windows):**
  ```powershell
  [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("ваш_api_ключ"))
  ```

- **Linux/Mac:**
  ```bash
  echo -n "ваш_api_ключ" | base64
  ```

- **Онлайн:** https://www.base64encode.org/

### Ошибка: "404 Not Found"

```bash
# Проверьте vercel.json routing
cat vercel.json | grep routes
```

### Медленная загрузка

```bash
# Включите кэширование
# Уже настроено в vercel.json

# Оптимизируйте изображения
# Используйте CDN для Font Awesome
```

## 💰 Стоимость

### Vercel Free Plan:

- ✅ Безлимитный bandwidth
- ✅ Автоматический HTTPS
- ✅ Глобальный CDN
- ✅ Preview deployments
- ⚠️ 100 GB bandwidth/месяц
- ⚠️ Коммерческое использование ограничено

### Для production:

Рассмотрите **Vercel Pro** ($20/месяц) если:
- Высокий трафик (>100GB/месяц)
- Коммерческое использование
- Нужна приоритетная поддержка

## 📞 Поддержка

### Vercel:
- Документация: https://vercel.com/docs
- Support: https://vercel.com/support
- Community: https://github.com/vercel/vercel/discussions

### Проект:
- Issues: GitHub Issues
- Документация: README.md
- Безопасность: SECURITY.md

## ✅ Checklist перед деплоем

- [ ] `js/config.js` в `.gitignore`
- [ ] API ключи не в репозитории
- [ ] Настроены Environment Variables на Vercel (`API_KEY_1`, `API_KEY_2` и т.д.)
- [ ] `vercel.json` настроен (уже включает build команду)
- [ ] `package.json` создан (для build скрипта)
- [ ] `build-config.js` работает локально (`npm run build`)
- [ ] Протестировано локально
- [ ] Работает на мобильных
- [ ] README обновлен
- [ ] Нет console.log в production коде (опционально)

## 🎯 После деплоя

1. ✅ Откройте приложение на Vercel URL
2. ✅ Добавьте API ключи через интерфейс
3. ✅ Проверьте создание inbox
4. ✅ Протестируйте на мобильном
5. ✅ Настройте пользовательский домен (опционально)

---

**Готово!** Ваше приложение теперь доступно всему миру! 🌍

