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

### Вариант 1: Environment Variables (рекомендуется для production)

1. В Vercel Dashboard откройте ваш проект
2. Перейдите в **Settings → Environment Variables**
3. Добавьте переменные:

```
MAILSLURP_KEY_1=your_first_api_key
MAILSLURP_KEY_2=your_second_api_key
MAILSLURP_KEY_3=your_third_api_key
```

4. Обновите `js/config.js` для использования переменных окружения

### Вариант 2: Локальный config.js (текущий)

1. Убедитесь, что `js/config.js` существует локально
2. При деплое Vercel использует ваш локальный файл
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
5. Ключи сохранятся в localStorage браузера

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

### Ошибка: "API ключи не найдены"

```bash
# Решение 1: Создайте config.js локально
cp js/config.example.js js/config.js
# Добавьте ваши ключи

# Решение 2: Используйте Environment Variables
# В Vercel Dashboard → Settings → Environment Variables
```

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
- [ ] `vercel.json` настроен
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

