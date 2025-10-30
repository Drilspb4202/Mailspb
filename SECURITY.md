# 🔐 Безопасность API ключей

## ⚠️ ВАЖНО!

API ключи теперь хранятся в отдельном файле `js/config.js` который **НЕ ДОЛЖЕН** публиковаться в открытых репозиториях!

## 📁 Структура защиты

### Файл config.js

```javascript
// js/config.js
const ENCODED_API_KEYS = [
    "Base64_закодированный_ключ_1",
    "Base64_закодированный_ключ_2",
    "Base64_закодированный_ключ_3"
];
```

### Что это дает?

1. ✅ **Централизация** - Все ключи в одном месте
2. ✅ **Базовое шифрование** - Ключи закодированы в Base64
3. ✅ **Git ignore** - Файл исключен из репозитория
4. ✅ **Легкая замена** - Можно быстро обновить ключи

## 🔧 Установка

### 1. После клонирования репозитория

Файл `js/config.js` не будет включен. Вам нужно создать его:

```bash
# Скопируйте шаблон
cp js/config.example.js js/config.js

# Добавьте свои ключи
nano js/config.js
```

### 2. Добавьте свои API ключи

Откройте `js/config.js` и замените ключи на свои:

```javascript
const ENCODED_API_KEYS = [
    "ваш_base64_ключ_1",
    "ваш_base64_ключ_2",
    "ваш_base64_ключ_3"
];
```

### 3. Закодируйте ключи

Используйте онлайн Base64 кодировщик или команду:

```bash
# Linux/Mac
echo -n "your_api_key_here" | base64

# Windows PowerShell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("your_api_key_here"))
```

## 🚨 Что НЕЛЬЗЯ делать

❌ **НЕ коммитьте** `js/config.js` в Git  
❌ **НЕ публикуйте** API ключи в открытом виде  
❌ **НЕ делитесь** ключами публично  
❌ **НЕ храните** ключи в незащищенных местах  

## ✅ Лучшие практики

### Для разработчиков

1. **Используйте config.example.js** как шаблон
2. **Добавьте config.js в .gitignore**
3. **Документируйте** процесс получения ключей
4. **Ротируйте** ключи регулярно

### Для пользователей

1. **Зарегистрируйтесь** на [MailSlurp.com](https://www.mailslurp.com)
2. **Получите** свои API ключи
3. **Закодируйте** их в Base64
4. **Добавьте** в `js/config.js`

## 📝 Пример config.js

```javascript
/**
 * Конфигурационный файл с API ключами
 * ⚠️ НЕ ПУБЛИКУЙТЕ ЭТОТ ФАЙЛ В ОТКРЫТОМ РЕПОЗИТОРИИ!
 * Добавьте config.js в .gitignore
 */

// Закодированные API ключи (Base64)
const ENCODED_API_KEYS = [
    "NjljMTk4MzM2Nzg5N2RmMmUwZjI4ZTY4ZWVhYjE1NjczMTJlN2I4Y2I2M2IzMjkyNGIxM2YwOWI0ZTVlZjk1OQ==",
    "MGQ3MTQwMGZlMjg0NzE3MzhjZjBiOTMzZmZhYTcwMWQ5Y2U3ZDllMDllMDdkNTJjMjcxNzUzYzM4N2Y4YmZjYg==",
    "MDdkYTA4ZjkyN2YzYzM1NGJkZGNiYTA5M2YzOGVlODNmMzdlZTI2NWM3ZTEwMDBlMzVhNGVmMjM2ZTVhNDNjYg=="
];

/**
 * Получить декодированные API ключи
 */
function getApiKeys() {
    try {
        return ENCODED_API_KEYS.map(encoded => atob(encoded));
    } catch (error) {
        console.error('Ошибка декодирования API ключей');
        return [];
    }
}

// Экспорт для использования в других модулях
window.API_CONFIG = {
    getKeys: getApiKeys
};
```

## 🔍 Проверка безопасности

### Перед коммитом проверьте:

```bash
# Убедитесь что config.js в .gitignore
git check-ignore js/config.js
# Должно вернуть: js/config.js

# Проверьте что файл не отслеживается
git status
# config.js НЕ должен быть в списке
```

### Если случайно закоммитили ключи:

```bash
# Удалите файл из истории Git
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch js/config.js" \
  --prune-empty --tag-name-filter cat -- --all

# Немедленно измените API ключи на MailSlurp!
```

## 🆘 Помощь

Если вы случайно опубликовали API ключи:

1. **Немедленно** войдите в MailSlurp
2. **Удалите** скомпрометированные ключи
3. **Создайте** новые ключи
4. **Обновите** config.js
5. **Очистите** Git историю (см. выше)

## 📞 Контакты

При возникновении вопросов по безопасности:
- Создайте Issue (БЕЗ ключей!)
- Обратитесь к документации MailSlurp
- Свяжитесь с поддержкой MailSlurp

---

**Помните**: Безопасность ваших API ключей - ваша ответственность!

