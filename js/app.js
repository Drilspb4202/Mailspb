/**
 * Главный контроллер приложения MailSlurp
 * Координирует работу всех модулей
 */
class MailSlurpApp {
    constructor() {
        // Инициализация модулей
        this.api = new MailSlurpApi();
        this.generator = new DataGenerator();
        this.i18n = new I18nManager();
        this.performanceOptimizer = new PerformanceOptimizer();
        
        // Данные приложения
        this.inboxes = new Map(); // inbox id -> inbox data
        this.emails = new Map(); // inbox id -> array of emails
        this.inboxTimers = new Map(); // inbox id -> timer data
        
        // UI будет инициализирован после загрузки DOM
        this.ui = null;
        
        // Event listeners
        this.eventListeners = new Map();
        
        this.init();
    }

    /**
     * Инициализация приложения
     */
    init() {
        // Дождаться загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.onDOMReady();
            });
        } else {
            this.onDOMReady();
        }
    }

    /**
     * Обработчик готовности DOM
     */
    onDOMReady() {
        try {
            // Инициализировать UI
            this.ui = new MailSlurpUI(this);
            
            // Инициализировать интернационализацию
            this.i18n.init();
            
            // Проверить наличие API ключей
            const activeKeys = this.api.getKeyPool().getActiveKeysCount();
            const totalKeys = this.api.getKeyPool().getAllKeys().length;
            
            // Загрузить сохраненные данные
            this.loadStoredData();
            
            // Запустить автоочистку кэша
            this.performanceOptimizer.startCacheCleanup();
            
            console.log('MailSlurp приложение инициализировано');
            
            // Показать предупреждение, если нет ключей
            if (totalKeys === 0) {
                this.ui.showNotification(
                    '⚠️ API ключи не настроены! Создайте файл js/config.js с вашими API ключами MailSlurp. Смотрите js/config.example.js для примера.',
                    'error'
                );
            } else if (activeKeys === 0) {
                this.ui.showNotification(
                    '⚠️ Все API ключи исчерпаны! Добавьте новые ключи в файле js/config.js.',
                    'error'
                );
            } else {
                // Показать приветственное сообщение
                this.ui.showNotification(
                    this.i18n.currentLanguage === 'ru' 
                        ? 'Добро пожаловать в MailSlurp!' 
                        : 'Welcome to MailSlurp!',
                    'success'
                );
            }
        } catch (error) {
            console.error('Ошибка инициализации приложения:', error);
        }
    }

    /**
     * Добавить почтовый ящик
     */
    addInbox(inbox, lifetime) {
        this.inboxes.set(inbox.id, {
            ...inbox,
            createdAt: Date.now(),
            expiresAt: Date.now() + lifetime
        });

        // Сохранить в localStorage
        this.saveStoredData();

        // Начать отслеживание писем
        this.startEmailTracking(inbox.id);

        // Установить таймер удаления
        this.setInboxExpiry(inbox.id, lifetime);

        // Emit event
        this.emit('inbox-created', inbox);
    }

    /**
     * Удалить почтовый ящик
     */
    async removeInbox(inboxIdOrEmail) {
        let inboxId;

        // Найти inbox по email или id
        for (const [id, inbox] of this.inboxes.entries()) {
            if (id === inboxIdOrEmail || inbox.emailAddress === inboxIdOrEmail) {
                inboxId = id;
                break;
            }
        }

        if (!inboxId) return;

        // Остановить таймер
        if (this.inboxTimers.has(inboxId)) {
            clearInterval(this.inboxTimers.get(inboxId).trackingInterval);
            clearTimeout(this.inboxTimers.get(inboxId).expiryTimeout);
            this.inboxTimers.delete(inboxId);
        }

        // Удалить из API
        try {
            await this.api.deleteInbox(inboxId);
        } catch (error) {
            console.error('Ошибка удаления inbox из API:', error);
        }

        // Удалить из локального хранилища
        this.inboxes.delete(inboxId);
        this.emails.delete(inboxId);

        // Сохранить
        this.saveStoredData();

        // Emit event
        this.emit('inbox-removed', inboxId);

        // Обновить UI
        if (this.ui) {
            this.ui.updateSendFromList();
        }
    }

    /**
     * Получить все почтовые ящики
     */
    getInboxes() {
        return Array.from(this.inboxes.values());
    }

    /**
     * Получить inbox по ID
     */
    getInbox(inboxId) {
        return this.inboxes.get(inboxId);
    }

    /**
     * Установить таймер истечения inbox
     */
    setInboxExpiry(inboxId, lifetime) {
        const expiryTimeout = setTimeout(() => {
            this.removeInbox(inboxId);
        }, lifetime);

        if (!this.inboxTimers.has(inboxId)) {
            this.inboxTimers.set(inboxId, {});
        }

        this.inboxTimers.get(inboxId).expiryTimeout = expiryTimeout;
    }

    /**
     * Начать отслеживание писем для inbox
     */
    startEmailTracking(inboxId) {
        // Создать интервал для проверки новых писем
        const trackingInterval = setInterval(async () => {
            try {
                await this.checkNewEmails(inboxId);
            } catch (error) {
                console.error('Ошибка проверки новых писем:', error);
            }
        }, 30000); // Каждые 30 секунд

        if (!this.inboxTimers.has(inboxId)) {
            this.inboxTimers.set(inboxId, {});
        }

        this.inboxTimers.get(inboxId).trackingInterval = trackingInterval;

        // Сразу проверить письма
        this.checkNewEmails(inboxId);
    }

    /**
     * Проверить новые письма
     */
    async checkNewEmails(inboxId) {
        try {
            const emails = await this.api.getEmails(inboxId, { 
                limit: 20,
                sort: 'DESC'
            });

            // Обновить список писем
            if (emails && emails.length > 0) {
                this.emails.set(inboxId, emails);
                this.saveStoredData();

                // Emit event
                this.emit('emails-updated', { inboxId, emails });
            }
        } catch (error) {
            console.error('Ошибка проверки писем:', error);
        }
    }

    /**
     * Загрузить все письма из всех ящиков
     */
    async loadEmails() {
        const allEmails = [];

        for (const inboxId of this.inboxes.keys()) {
            try {
                await this.checkNewEmails(inboxId);
                const emails = this.emails.get(inboxId) || [];
                allEmails.push(...emails);
            } catch (error) {
                console.error(`Ошибка загрузки писем для ${inboxId}:`, error);
            }
        }

        // Сортировать по дате
        allEmails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return allEmails;
    }

    /**
     * Получить все письма
     */
    getAllEmails() {
        const allEmails = [];

        for (const emails of this.emails.values()) {
            allEmails.push(...emails);
        }

        // Сортировать по дате
        allEmails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return allEmails;
    }

    /**
     * Сохранить данные в localStorage
     */
    saveStoredData() {
        try {
            const data = {
                inboxes: Array.from(this.inboxes.entries()),
                emails: Array.from(this.emails.entries()),
                timestamp: Date.now()
            };

            localStorage.setItem('mailslurp_data', JSON.stringify(data));
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
        }
    }

    /**
     * Загрузить данные из localStorage
     */
    loadStoredData() {
        try {
            const stored = localStorage.getItem('mailslurp_data');
            
            if (!stored) return;

            const data = JSON.parse(stored);

            // Проверить, не устарели ли данные (старше 24 часов)
            if (Date.now() - data.timestamp > 86400000) {
                localStorage.removeItem('mailslurp_data');
                return;
            }

            // Восстановить inboxes
            this.inboxes = new Map(data.inboxes);

            // Восстановить emails
            this.emails = new Map(data.emails);

            // Восстановить отслеживание для активных ящиков
            for (const [inboxId, inbox] of this.inboxes.entries()) {
                const remaining = inbox.expiresAt - Date.now();
                
                if (remaining > 0) {
                    // Inbox еще активен
                    this.startEmailTracking(inboxId);
                    this.setInboxExpiry(inboxId, remaining);

                    // Обновить UI если есть текущий email
                    if (this.ui && inbox.emailAddress) {
                        this.ui.displayCreatedEmail(inbox.emailAddress, remaining);
                    }
                } else {
                    // Inbox истек
                    this.removeInbox(inboxId);
                }
            }

            // Обновить UI
            if (this.ui) {
                this.ui.updateSendFromList();
            }

        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            localStorage.removeItem('mailslurp_data');
        }
    }

    /**
     * Очистить все данные
     */
    clearAllData() {
        // Остановить все таймеры
        for (const timers of this.inboxTimers.values()) {
            if (timers.trackingInterval) clearInterval(timers.trackingInterval);
            if (timers.expiryTimeout) clearTimeout(timers.expiryTimeout);
        }

        // Очистить данные
        this.inboxes.clear();
        this.emails.clear();
        this.inboxTimers.clear();

        // Очистить localStorage
        localStorage.removeItem('mailslurp_data');

        // Очистить кэш
        this.api.clearCache();
    }

    /**
     * Event system - подписка на события
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Event system - отписка от событий
     */
    off(event, callback) {
        if (!this.eventListeners.has(event)) return;
        
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }

    /**
     * Event system - генерация событий
     */
    emit(event, data) {
        if (!this.eventListeners.has(event)) return;
        
        const listeners = this.eventListeners.get(event);
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Ошибка в обработчике события ${event}:`, error);
            }
        });
    }

    /**
     * Получить статистику приложения
     */
    getStats() {
        return {
            totalInboxes: this.inboxes.size,
            totalEmails: this.getAllEmails().length,
            activeKeys: this.api.getKeyPool().getActiveKeysCount(),
            cacheSize: this.performanceOptimizer.getCacheStats().size
        };
    }
}

// Инициализировать приложение при загрузке
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new MailSlurpApp();
    });
} else {
    app = new MailSlurpApp();
}

