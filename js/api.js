/**
 * API клиент для работы с MailSlurp
 * Обрабатывает все запросы к API
 */
class MailSlurpApi {
    constructor() {
        this.keyPool = new ApiKeyPool();
        this.keyManager = new ApiKeyManager(this.keyPool);
        this.baseUrl = 'https://api.mailslurp.com';
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.performanceOptimizer = new PerformanceOptimizer();
    }

    /**
     * Выполнить HTTP запрос
     */
    async request(endpoint, options = {}) {
        const apiKey = this.keyManager.getKey();
        const maskedKey = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            }
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        // Логировать запрос с активным ключом
        console.log(`🔑 ${finalOptions.method} ${endpoint} [Ключ: ${maskedKey}]`);

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, finalOptions);
            
            if (!response.ok) {
                const error = new Error(`HTTP error! status: ${response.status}`);
                error.status = response.status;
                error.response = await response.json().catch(() => ({}));
                
                // Проверить специфические ошибки лимитов
                if (error.response && error.response.message) {
                    const message = error.response.message;
                    
                    // Превышен месячный лимит CreateInbox
                    if (message.includes('CreateInbox feature limit') || 
                        message.includes('limit') && message.includes('exceeded')) {
                        console.error(`❌ Ключ ${maskedKey} исчерпал месячный лимит!`);
                        error.isLimitExceeded = true;
                    }
                }
                
                // Обработать ошибку ключа
                this.keyManager.handleKeyError(apiKey, error);
                
                throw error;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    /**
     * Выполнить запрос с повторными попытками
     */
    async requestWithRetry(endpoint, options = {}, retries = this.maxRetries) {
        try {
            return await this.request(endpoint, options);
        } catch (error) {
            // Проверить, нужно ли переключиться на другой ключ
            const shouldRetry = error.status === 401 || 
                              error.status === 403 || 
                              error.status === 429 ||
                              error.status === 500 ||
                              error.isLimitExceeded; // Превышен лимит
            
            if (retries > 0 && this.keyManager.hasAvailableKeys() && shouldRetry) {
                const activeKeys = this.keyPool.getActiveKeysCount();
                
                if (error.isLimitExceeded) {
                    console.warn(`⚠️ Ключ исчерпал месячный лимит (${endpoint}). Переключаемся на следующий... (Осталось ключей: ${activeKeys})`);
                } else if (error.status === 429) {
                    console.warn(`⚠️ Rate Limit (429). Переключаемся на следующий ключ... (Осталось: ${activeKeys})`);
                } else if (error.status === 401 || error.status === 403) {
                    console.warn(`⚠️ Ошибка авторизации (${error.status}). Переключаемся на следующий ключ... (Осталось: ${activeKeys})`);
                } else {
                    console.log(`🔄 Повтор запроса, осталось попыток: ${retries}`);
                }
                
                await this.delay(this.retryDelay);
                return this.requestWithRetry(endpoint, options, retries - 1);
            }
            
            // Если нет доступных ключей
            if (!this.keyManager.hasAvailableKeys()) {
                console.error('❌ Все API ключи исчерпаны! Добавьте новые ключи в файле js/config.js.');
            }
            
            throw error;
        }
    }

    /**
     * Создать новый почтовый ящик
     */
    async createInbox(options = {}) {
        const cacheKey = `inbox_${Date.now()}`;
        
        // MailSlurp API принимает параметры в теле запроса
        const payload = {};
        if (options.name) {
            payload.name = options.name;
        }
        if (options.expiresAt) {
            payload.expiresAt = options.expiresAt;
        }

        const endpoint = '/inboxes';
        
        try {
            const requestOptions = {
                method: 'POST'
            };
            
            // Если есть параметры, добавить их в тело
            if (Object.keys(payload).length > 0) {
                requestOptions.body = JSON.stringify(payload);
            }
            
            const inbox = await this.requestWithRetry(endpoint, requestOptions);

            // Кэшировать результат
            this.performanceOptimizer.setCache(cacheKey, inbox, 300000); // 5 минут
            
            return inbox;
        } catch (error) {
            console.error('Ошибка создания почтового ящика:', error);
            console.error('Детали ошибки:', error.response || error.message);
            throw error;
        }
    }

    /**
     * Получить список почтовых ящиков
     */
    async getInboxes() {
        const cacheKey = 'inboxes_list';
        
        // Проверить кэш
        const cached = this.performanceOptimizer.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            const inboxes = await this.requestWithRetry('/inboxes');
            
            // Кэшировать результат
            this.performanceOptimizer.setCache(cacheKey, inboxes, 60000); // 1 минута
            
            return inboxes;
        } catch (error) {
            console.error('Ошибка получения списка ящиков:', error);
            throw error;
        }
    }

    /**
     * Получить почтовый ящик по ID
     */
    async getInbox(inboxId) {
        const cacheKey = `inbox_${inboxId}`;
        
        // Проверить кэш
        const cached = this.performanceOptimizer.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            const inbox = await this.requestWithRetry(`/inboxes/${inboxId}`);
            
            // Кэшировать результат
            this.performanceOptimizer.setCache(cacheKey, inbox, 60000);
            
            return inbox;
        } catch (error) {
            console.error('Ошибка получения ящика:', error);
            throw error;
        }
    }

    /**
     * Удалить почтовый ящик
     */
    async deleteInbox(inboxId) {
        try {
            await this.requestWithRetry(`/inboxes/${inboxId}`, {
                method: 'DELETE'
            });

            // Очистить кэш
            this.performanceOptimizer.clearCache(`inbox_${inboxId}`);
            this.performanceOptimizer.clearCache('inboxes_list');
            
            return true;
        } catch (error) {
            console.error('Ошибка удаления ящика:', error);
            throw error;
        }
    }

    /**
     * Получить письма из почтового ящика
     */
    async getEmails(inboxId, options = {}) {
        const cacheKey = `emails_${inboxId}`;
        
        // Не использовать кэш для получения новых писем
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit);
        if (options.sort) params.append('sort', options.sort);

        const endpoint = `/inboxes/${inboxId}/emails?${params.toString()}`;

        try {
            const emails = await this.requestWithRetry(endpoint);
            return emails;
        } catch (error) {
            console.error('Ошибка получения писем:', error);
            throw error;
        }
    }

    /**
     * Получить письмо по ID
     */
    async getEmail(emailId) {
        const cacheKey = `email_${emailId}`;
        
        // Проверить кэш
        const cached = this.performanceOptimizer.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            const email = await this.requestWithRetry(`/emails/${emailId}`);
            
            // Кэшировать результат
            this.performanceOptimizer.setCache(cacheKey, email, 300000); // 5 минут
            
            return email;
        } catch (error) {
            console.error('Ошибка получения письма:', error);
            throw error;
        }
    }

    /**
     * Отправить письмо
     */
    async sendEmail(inboxId, emailData) {
        const payload = {
            to: emailData.to ? [emailData.to] : [],
            subject: emailData.subject || '',
            body: emailData.body || '',
            from: emailData.from || null
        };

        try {
            const result = await this.requestWithRetry(`/inboxes/${inboxId}/send`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            return result;
        } catch (error) {
            console.error('Ошибка отправки письма:', error);
            throw error;
        }
    }

    /**
     * Ожидать получения письма
     */
    async waitForLatestEmail(inboxId, timeout = 30000) {
        const params = new URLSearchParams({
            timeout: timeout,
            unreadOnly: true
        });

        try {
            const email = await this.requestWithRetry(
                `/inboxes/${inboxId}/waitForLatestEmail?${params.toString()}`,
                {},
                1 // Только одна попытка для ожидания
            );

            return email;
        } catch (error) {
            if (error.status === 408) {
                // Таймаут - это нормально
                return null;
            }
            console.error('Ошибка ожидания письма:', error);
            throw error;
        }
    }

    /**
     * Получить статус API ключа
     */
    async getApiKeyStatus() {
        try {
            const status = await this.requestWithRetry('/account');
            return status;
        } catch (error) {
            console.error('Ошибка проверки статуса API ключа:', error);
            throw error;
        }
    }

    /**
     * Задержка
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Получить пул ключей
     */
    getKeyPool() {
        return this.keyPool;
    }

    /**
     * Получить менеджер ключей
     */
    getKeyManager() {
        return this.keyManager;
    }

    /**
     * Очистить кэш
     */
    clearCache() {
        this.performanceOptimizer.clearCache();
    }
}

