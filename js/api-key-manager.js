/**
 * Менеджер API ключей
 * Управляет переключением между ключами при ошибках
 */
class ApiKeyManager {
    constructor(keyPool) {
        this.keyPool = keyPool;
        this.failedKeys = new Set();
        this.retryCount = new Map();
        this.maxRetries = 3;
    }

    /**
     * Получить ключ для использования
     */
    getKey() {
        try {
            return this.keyPool.getNextKey();
        } catch (error) {
            // Если все ключи исчерпаны, попробовать сбросить счетчик для первого ключа
            this.keyPool.resetAllKeys();
            return this.keyPool.getNextKey();
        }
    }

    /**
     * Обработать ошибку ключа
     */
    handleKeyError(key, error) {
        const maskedKey = key.substring(0, 8) + '...' + key.substring(key.length - 4);
        
        // Проверить тип ошибки
        if (error.status === 401 || error.status === 403) {
            // Ключ недействителен - немедленно пометить как исчерпанный
            console.error(`❌ Ключ ${maskedKey} недействителен (${error.status}). Отключен.`);
            this.failedKeys.add(key);
            this.keyPool.markKeyAsExhausted(key);
        } else if (error.status === 429) {
            // Превышен лимит запросов - пометить как исчерпанный
            console.warn(`⚠️ Ключ ${maskedKey} исчерпан (429 Rate Limit). Отключен.`);
            this.failedKeys.add(key);
            this.keyPool.markKeyAsExhausted(key);
        } else if (error.isLimitExceeded) {
            // Превышен месячный лимит (например CreateInbox limit)
            console.error(`❌ Ключ ${maskedKey} превысил месячный лимит! Отключен.`);
            this.failedKeys.add(key);
            this.keyPool.markKeyAsExhausted(key);
        } else {
            // Другие ошибки - увеличить счетчик
            const currentRetries = this.retryCount.get(key) || 0;
            this.retryCount.set(key, currentRetries + 1);

            // Если превышено максимальное количество попыток
            if (currentRetries >= this.maxRetries) {
                console.error(`❌ Ключ ${maskedKey} отключен после ${this.maxRetries} ошибок.`);
                this.failedKeys.add(key);
                this.keyPool.markKeyAsExhausted(key);
            }
        }
    }

    /**
     * Проверить, есть ли доступные ключи
     */
    hasAvailableKeys() {
        return this.keyPool.getActiveKeysCount() > 0;
    }

    /**
     * Сбросить счетчики ошибок
     */
    resetErrors() {
        this.failedKeys.clear();
        this.retryCount.clear();
    }
}

