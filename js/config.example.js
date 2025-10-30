/**
 * Пример конфигурационного файла с API ключами
 * 
 * ИНСТРУКЦИЯ:
 * 1. Скопируйте этот файл как js/config.js
 * 2. Замените примеры ниже на ваши реальные API ключи
 * 3. Закодируйте ключи в Base64 (используйте онлайн кодировщик или команду)
 * 4. НЕ публикуйте config.js в открытом репозитории!
 * 
 * Как закодировать ключ в Base64:
 * - Онлайн: https://www.base64encode.org/
 * - Linux/Mac: echo -n "your_key" | base64
 * - Windows: [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("your_key"))
 */

// Закодированные API ключи (Base64)
const ENCODED_API_KEYS = [
    "замените_на_ваш_base64_ключ_1",
    "замените_на_ваш_base64_ключ_2",
    "замените_на_ваш_base64_ключ_3"
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

