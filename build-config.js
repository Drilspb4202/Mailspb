/**
 * Скрипт для генерации config.js из переменных окружения
 * Используется при деплое на Vercel
 */

const fs = require('fs');
const path = require('path');

// Получить API ключи из переменных окружения
// Vercel поддерживает переменные вида: API_KEY_1, API_KEY_2, API_KEY_3, etc.
function getApiKeysFromEnv() {
    const keys = [];
    let i = 1;
    
    while (process.env[`API_KEY_${i}`]) {
        const key = process.env[`API_KEY_${i}`];
        // Кодируем в Base64
        const encoded = Buffer.from(key).toString('base64');
        keys.push(encoded);
        i++;
    }
    
    return keys;
}

// Альтернативный способ: все ключи через запятую в одной переменной
function getApiKeysFromSingleEnv() {
    const apiKeysEnv = process.env.API_KEYS;
    if (!apiKeysEnv) return [];
    
    return apiKeysEnv
        .split(',')
        .map(key => key.trim())
        .filter(key => key.length > 0)
        .map(key => Buffer.from(key).toString('base64'));
}

// Попробовать оба способа
let encodedKeys = getApiKeysFromEnv();
if (encodedKeys.length === 0) {
    encodedKeys = getApiKeysFromSingleEnv();
}

if (encodedKeys.length === 0) {
    console.warn('⚠️  Предупреждение: API ключи не найдены в переменных окружения!');
    console.warn('Настройте переменные окружения на Vercel:');
    console.warn('  - API_KEY_1, API_KEY_2, API_KEY_3 (отдельные переменные)');
    console.warn('  - или API_KEYS (все ключи через запятую)');
}

// Генерируем содержимое config.js
const configContent = `/**
 * Конфигурационный файл с API ключами
 * ⚠️ НЕ ПУБЛИКУЙТЕ ЭТОТ ФАЙЛ В ОТКРЫТОМ РЕПОЗИТОРИИ!
 * Добавьте config.js в .gitignore
 * 
 * Этот файл автоматически сгенерирован при деплое на Vercel
 * из переменных окружения проекта.
 */

// Закодированные API ключи (Base64 для базовой защиты)
const ENCODED_API_KEYS = [
${encodedKeys.map(key => `    "${key}"`).join(',\n')}
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
`;

// Создать директорию, если её нет
const configDir = path.join(__dirname, 'js');
if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
}

// Записать файл
const configPath = path.join(configDir, 'config.js');
fs.writeFileSync(configPath, configContent, 'utf8');

console.log(`✅ config.js успешно создан в ${configPath}`);
console.log(`📊 Найдено ключей: ${encodedKeys.length}`);

