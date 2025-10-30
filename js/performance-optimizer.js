/**
 * Оптимизатор производительности
 * Кэширование и оптимизация запросов
 */
class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = new Map();
        this.defaultTTL = 60000; // 1 минута
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.maxConcurrentRequests = 3;
        this.activeRequests = 0;
    }

    /**
     * Получить из кэша
     */
    getFromCache(key) {
        const expiry = this.cacheExpiry.get(key);
        
        if (expiry && Date.now() > expiry) {
            // Кэш истек
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
            return null;
        }
        
        return this.cache.get(key);
    }

    /**
     * Сохранить в кэш
     */
    setCache(key, value, ttl = this.defaultTTL) {
        this.cache.set(key, value);
        this.cacheExpiry.set(key, Date.now() + ttl);
    }

    /**
     * Очистить кэш
     */
    clearCache(key = null) {
        if (key) {
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
        } else {
            this.cache.clear();
            this.cacheExpiry.clear();
        }
    }

    /**
     * Очистить истекший кэш
     */
    cleanExpiredCache() {
        const now = Date.now();
        
        for (const [key, expiry] of this.cacheExpiry.entries()) {
            if (now > expiry) {
                this.cache.delete(key);
                this.cacheExpiry.delete(key);
            }
        }
    }

    /**
     * Debounce функция
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle функция
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Добавить запрос в очередь
     */
    async queueRequest(requestFn) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ requestFn, resolve, reject });
            this.processQueue();
        });
    }

    /**
     * Обработать очередь запросов
     */
    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
            const { requestFn, resolve, reject } = this.requestQueue.shift();
            this.activeRequests++;

            requestFn()
                .then(result => {
                    resolve(result);
                    this.activeRequests--;
                    this.processQueue();
                })
                .catch(error => {
                    reject(error);
                    this.activeRequests--;
                    this.processQueue();
                });
        }

        if (this.requestQueue.length === 0) {
            this.isProcessingQueue = false;
        }
    }

    /**
     * Получить статистику кэша
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys())
        };
    }

    /**
     * Lazy loading для изображений
     */
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    /**
     * Автоматическая очистка кэша по расписанию
     */
    startCacheCleanup(interval = 300000) { // 5 минут
        setInterval(() => {
            this.cleanExpiredCache();
        }, interval);
    }
}

