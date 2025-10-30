/**
 * Пул публичных API ключей
 * Управляет ротацией и использованием ключей
 */
class ApiKeyPool {
    constructor() {
        // Получить API ключи из защищенного конфига
        const apiKeys = window.API_CONFIG ? window.API_CONFIG.getKeys() : [];
        
        // Инициализировать пул ключей
        this.publicKeys = apiKeys.map(key => ({
            key: key,
            usageCount: 0,
            isExhausted: false
        }));
        
        this.maxUsagePerKey = 100; // Максимальное количество использований ключа
        this.currentKeyIndex = 0;
        
        // Загрузить пользовательские ключи из localStorage
        this.loadUserKeys();
    }

    /**
     * Загрузить пользовательские ключи
     */
    loadUserKeys() {
        const stored = localStorage.getItem('userApiKeys');
        if (stored) {
            try {
                const userKeys = JSON.parse(stored);
                userKeys.forEach(key => {
                    this.publicKeys.push({
                        key: key,
                        usageCount: 0,
                        isExhausted: false,
                        isUserKey: true
                    });
                });
            } catch (error) {
                console.error('Ошибка загрузки пользовательских ключей:', error);
            }
        }
    }

    /**
     * Сохранить пользовательские ключи
     */
    saveUserKeys() {
        const userKeys = this.publicKeys
            .filter(k => k.isUserKey)
            .map(k => k.key);
        localStorage.setItem('userApiKeys', JSON.stringify(userKeys));
    }

    /**
     * Получить следующий доступный ключ
     */
    getNextKey() {
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
        
        throw new Error('Все API ключи исчерпаны');
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
     * Добавить пользовательский ключ
     */
    addUserKey(key) {
        if (!key || key.trim() === '') {
            throw new Error('Пустой ключ');
        }
        
        // Проверить, не существует ли уже такой ключ
        if (this.publicKeys.some(k => k.key === key)) {
            throw new Error('Ключ уже существует');
        }
        
        this.publicKeys.push({
            key: key,
            usageCount: 0,
            isExhausted: false,
            isUserKey: true
        });
        
        this.saveUserKeys();
        console.log('✅ Пользовательский ключ добавлен и сохранен');
    }

    /**
     * Удалить пользовательский ключ
     */
    removeUserKey(key) {
        const index = this.publicKeys.findIndex(k => k.key === key && k.isUserKey);
        if (index !== -1) {
            this.publicKeys.splice(index, 1);
            this.saveUserKeys();
            return true;
        }
        return false;
    }

    /**
     * Получить все ключи
     */
    getAllKeys() {
        return this.publicKeys.map(k => ({
            key: k.key,
            usageCount: k.usageCount,
            isExhausted: k.isExhausted,
            isUserKey: k.isUserKey || false
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

