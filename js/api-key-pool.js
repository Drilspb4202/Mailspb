/**
 * Пул публичных API ключей
 * Управляет ротацией и использованием ключей
 */
class ApiKeyPool {
    constructor() {
        // Получить API ключи из защищенного конфига
        let apiKeys = [];
        try {
            if (window.API_CONFIG && typeof window.API_CONFIG.getKeys === 'function') {
                apiKeys = window.API_CONFIG.getKeys() || [];
            }
        } catch (error) {
            console.warn('⚠️ Не удалось загрузить API ключи из config.js:', error);
        }
        
        // Инициализировать пул ключей
        this.publicKeys = apiKeys.map(key => ({
            key: key,
            usageCount: 0,
            isExhausted: false
        }));
        
        this.maxUsagePerKey = 100; // Максимальное количество использований ключа
        this.currentKeyIndex = 0;
        
        // Проверить, есть ли хотя бы один ключ
        if (this.publicKeys.length === 0) {
            console.warn('⚠️ API ключи не найдены! Создайте файл js/config.js с вашими API ключами');
        } else {
            console.log(`✅ Загружено ${this.publicKeys.length} API ключей из config.js`);
        }
    }

    /**
     * Получить следующий доступный ключ
     */
    getNextKey() {
        // Проверить, есть ли вообще ключи
        if (this.publicKeys.length === 0) {
            throw new Error('API ключи не настроены. Создайте файл js/config.js с вашими API ключами MailSlurp. Смотрите js/config.example.js для примера.');
        }
        
        // Найти первый неисчерпанный ключ
        for (let i = 0; i < this.publicKeys.length; i++) {
            const keyIndex = (this.currentKeyIndex + i) % this.publicKeys.length;
            const keyData = this.publicKeys[keyIndex];
            
            if (!keyData.isExhausted) {
                this.currentKeyIndex = keyIndex;
                keyData.usageCount++;
                
                // Проверить, не исчерпан ли ключ
                if (keyData.usageCount >= this.maxUsagePerKey) {
                    keyData.isExhausted = true;
                }
                
                return keyData.key;
            }
        }
        
        throw new Error('Все API ключи исчерпаны! Добавьте новые ключи в файле js/config.js.');
    }

    /**
     * Пометить ключ как исчерпанный
     */
    markKeyAsExhausted(key) {
        const keyData = this.publicKeys.find(k => k.key === key);
        if (keyData) {
            keyData.isExhausted = true;
        }
    }

    /**
     * Получить все ключи
     */
    getAllKeys() {
        return this.publicKeys.map(k => ({
            key: k.key,
            usageCount: k.usageCount,
            isExhausted: k.isExhausted
        }));
    }

    /**
     * Получить количество активных ключей
     */
    getActiveKeysCount() {
        return this.publicKeys.filter(k => !k.isExhausted).length;
    }

    /**
     * Сбросить использование всех ключей (для тестирования)
     */
    resetAllKeys() {
        this.publicKeys.forEach(k => {
            k.usageCount = 0;
            k.isExhausted = false;
        });
        this.currentKeyIndex = 0;
    }

    /**
     * Получить текущий ключ без увеличения счетчика
     */
    getCurrentKey() {
        for (let i = 0; i < this.publicKeys.length; i++) {
            const keyIndex = (this.currentKeyIndex + i) % this.publicKeys.length;
            const keyData = this.publicKeys[keyIndex];
            
            if (!keyData.isExhausted) {
                return keyData.key;
            }
        }
        
        throw new Error('Нет доступных API ключей');
    }
}

