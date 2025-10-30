/**
 * Управление UI компонентами
 * Обрабатывает все взаимодействия с интерфейсом
 */
class MailSlurpUI {
    constructor(app) {
        this.app = app;
        this.navItems = document.querySelectorAll('.nav-item');
        this.contentSections = document.querySelectorAll('.content-section');
        this.modals = document.querySelectorAll('.modal');
        this.notifications = document.getElementById('notifications');
        
        // Таймеры
        this.emailTimers = new Map();
        this.autoRefreshInterval = null;
        
        this.init();
    }

    /**
     * Инициализация UI
     */
    init() {
        this.setupNavigation();
        this.setupCreateEmailForm();
        this.setupGeneratorForm();
        this.setupSettings();
        this.setupModals();
        this.setupLanguageToggle();
        this.loadSettings();
    }
    
    /**
     * Настройка формы генератора
     */
    setupGeneratorForm() {
        const passwordLengthSlider = document.getElementById('passwordLength');
        const passwordLengthValue = document.getElementById('passwordLengthValue');
        
        if (passwordLengthSlider && passwordLengthValue) {
            passwordLengthSlider.addEventListener('input', (e) => {
                passwordLengthValue.textContent = e.target.value;
            });
        }
    }

    /**
     * Настройка навигации
     */
    setupNavigation() {
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                this.showSection(section);
            });
        });
    }

    /**
     * Показать секцию
     */
    showSection(sectionId) {
        // Обновить навигацию
        this.navItems.forEach(item => {
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Показать секцию
        this.contentSections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Специальные действия для секций
        if (sectionId === 'inbox') {
            this.refreshInbox();
        } else if (sectionId === 'settings') {
            this.updateSettingsUI();
        }
    }

    /**
     * Настройка формы создания email
     */
    setupCreateEmailForm() {
        const createBtn = document.getElementById('createInboxBtn');
        const copyBtn = document.getElementById('copyEmailBtn');

        // Создать почту
        createBtn.addEventListener('click', () => {
            this.createEmail();
        });

        // Копировать email
        copyBtn.addEventListener('click', () => {
            this.copyEmailToClipboard();
        });
    }

    /**
     * Создать email
     */
    async createEmail() {
        const lifetime = parseInt(document.getElementById('emailLifetime').value);

        const createBtn = document.getElementById('createInboxBtn');
        createBtn.disabled = true;
        createBtn.innerHTML = '<div class="loading"></div> <span>Создание...</span>';

        try {
            // Создать случайный inbox
            const inbox = await this.app.api.createInbox({});

            // Сохранить inbox
            this.app.addInbox(inbox, lifetime);

            // Показать созданный email
            this.displayCreatedEmail(inbox.emailAddress, lifetime);

            // Показать уведомление
            this.showNotification(
                this.app.i18n.t('notifications.emailCreated'),
                'success'
            );

            // Обновить список для отправки
            this.updateSendFromList();

        } catch (error) {
            console.error('Ошибка создания email:', error);
            
            // Показать детальную информацию об ошибке
            let errorMessage = this.app.i18n.t('notifications.errorCreating');
            
            if (error.isLimitExceeded) {
                errorMessage = '⚠️ API ключ исчерпал месячный лимит! Переключаемся на резервный...';
            } else if (error.status === 401 || error.status === 403) {
                errorMessage = '❌ Ошибка авторизации. Проверьте API ключи в настройках.';
            } else if (error.status === 429) {
                errorMessage = '⚠️ Превышен лимит запросов. Переключаемся на другой ключ...';
            } else if (error.response && error.response.message) {
                // Проверить специфические сообщения
                if (error.response.message.includes('limit')) {
                    errorMessage = '⚠️ Достигнут лимит! Переключаемся на резервный ключ...';
                } else {
                    errorMessage = `Ошибка: ${error.response.message}`;
                }
            } else if (error.message) {
                errorMessage = `Ошибка: ${error.message}`;
            }
            
            // Проверить, есть ли еще доступные ключи
            const activeKeys = this.app.api.getKeyPool().getActiveKeysCount();
            if (activeKeys === 0) {
                errorMessage = '❌ Все API ключи исчерпаны! Добавьте новые ключи в настройках.';
            }
            
            this.showNotification(errorMessage, 'error');
        } finally {
            createBtn.disabled = false;
            createBtn.innerHTML = '<i class="fas fa-magic"></i> <span data-i18n="create.generate">Создать почту</span>';
            this.app.i18n.updateUI();
        }
    }

    /**
     * Отобразить созданный email
     */
    displayCreatedEmail(email, lifetime) {
        const emailBox = document.getElementById('createdEmailBox');
        const emailSpan = document.getElementById('createdEmail');

        emailSpan.textContent = email;
        emailBox.style.display = 'block';

        // Запустить таймер
        this.startEmailTimer(email, lifetime);
    }

    /**
     * Запустить таймер для email
     */
    startEmailTimer(email, lifetime) {
        // Остановить предыдущий таймер
        if (this.emailTimers.has(email)) {
            clearInterval(this.emailTimers.get(email));
        }

        const timerSpan = document.getElementById('emailTimer');
        const expiryTime = Date.now() + lifetime;

        const timerId = setInterval(() => {
            const remaining = expiryTime - Date.now();

            if (remaining <= 0) {
                clearInterval(timerId);
                this.emailTimers.delete(email);
                timerSpan.textContent = '00:00';
                this.showNotification(
                    this.app.i18n.t('notifications.emailExpired'),
                    'info'
                );
                this.app.removeInbox(email);
            } else {
                timerSpan.textContent = this.app.generator.formatTime(remaining);
            }
        }, 1000);

        this.emailTimers.set(email, timerId);
    }

    /**
     * Копировать email в буфер обмена
     */
    async copyEmailToClipboard() {
        const emailSpan = document.getElementById('createdEmail');
        const email = emailSpan.textContent;

        try {
            await navigator.clipboard.writeText(email);
            this.showNotification(
                this.app.i18n.t('notifications.emailCopied'),
                'success'
            );
        } catch (error) {
            console.error('Ошибка копирования:', error);
        }
    }

    /**
     * Генератор данных - имя
     */
    generateFirstName() {
        const firstName = this.app.generator.generateFirstName();
        document.getElementById('generatedFirstName').value = firstName;
    }
    
    /**
     * Генератор данных - фамилия
     */
    generateLastName() {
        const lastName = this.app.generator.generateLastName();
        document.getElementById('generatedLastName').value = lastName;
    }
    
    /**
     * Генератор данных - логин
     */
    generateUsername() {
        const username = this.app.generator.generateUsername();
        document.getElementById('generatedUsername').value = username;
    }
    
    /**
     * Генератор данных - пароль
     */
    generatePassword() {
        const length = parseInt(document.getElementById('passwordLength').value);
        const password = this.app.generator.generatePassword(length);
        document.getElementById('generatedPassword').value = password;
    }
    
    /**
     * Сгенерировать все данные сразу
     */
    generateAll() {
        this.generateFirstName();
        this.generateLastName();
        this.generateUsername();
        this.generatePassword();
        this.showNotification('Все данные сгенерированы!', 'success');
    }
    
    /**
     * Копировать в буфер обмена
     */
    async copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        const text = element.value;
        
        if (!text) {
            this.showNotification('Сначала сгенерируйте данные', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Скопировано в буфер обмена!', 'success');
        } catch (error) {
            console.error('Ошибка копирования:', error);
            this.showNotification('Ошибка копирования', 'error');
        }
    }
    
    /**
     * Обновить список "От" для отправки
     */
    updateSendFromList() {
        // Метод больше не используется, но оставлен для совместимости
    }

    /**
     * Обновить входящие
     */
    async refreshInbox() {
        const emailList = document.getElementById('emailList');
        const refreshBtn = document.getElementById('refreshInboxBtn');

        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';

        try {
            const emails = await this.app.loadEmails();
            this.displayEmails(emails);
        } catch (error) {
            console.error('Ошибка загрузки писем:', error);
            this.showNotification(
                this.app.i18n.t('notifications.errorLoading'),
                'error'
            );
        } finally {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        }
    }

    /**
     * Отобразить список писем
     */
    displayEmails(emails) {
        const emailList = document.getElementById('emailList');

        if (!emails || emails.length === 0) {
            emailList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p data-i18n="inbox.empty">Нет сообщений. Создайте временную почту для получения писем.</p>
                </div>
            `;
            this.app.i18n.updateUI();
            return;
        }

        emailList.innerHTML = '';

        emails.forEach(email => {
            const emailItem = document.createElement('div');
            emailItem.className = 'email-item';
            emailItem.innerHTML = `
                <div class="email-item-header">
                    <div class="email-item-subject">${email.subject || '(Без темы)'}</div>
                    <div class="email-item-date">${this.app.generator.formatDate(email.createdAt)}</div>
                </div>
                <div class="email-item-from">От: ${email.from || 'Неизвестно'}</div>
                <div class="email-item-preview">${this.app.generator.extractPreview(email.body || '')}</div>
            `;

            emailItem.addEventListener('click', () => {
                this.showEmailModal(email);
            });

            emailList.appendChild(emailItem);
        });
    }

    /**
     * Показать модальное окно с письмом
     */
    async showEmailModal(email) {
        const modal = document.getElementById('emailModal');
        const bodyElement = document.getElementById('emailModalBody');
        
        document.getElementById('emailModalSubject').textContent = email.subject || '(Без темы)';
        document.getElementById('emailModalFrom').textContent = email.from || 'Неизвестно';
        document.getElementById('emailModalTo').textContent = email.to ? email.to.join(', ') : 'Неизвестно';
        document.getElementById('emailModalDate').textContent = this.app.generator.formatDate(email.createdAt);
        
        // Загрузить полное письмо если нужно
        let fullEmail = email;
        if (email.id && !email.body) {
            try {
                bodyElement.innerHTML = '<div style="text-align: center; padding: 20px;">⏳ Загрузка...</div>';
                fullEmail = await this.app.api.getEmail(email.id);
            } catch (error) {
                console.error('Ошибка загрузки письма:', error);
            }
        }
        
        // Отобразить тело письма как HTML
        const emailBody = fullEmail.body || fullEmail.textContent || '(Пустое письмо)';
        
        // Если есть HTML контент, отобразить его
        if (emailBody.includes('<html') || emailBody.includes('<body') || emailBody.includes('<div')) {
            bodyElement.innerHTML = emailBody;
        } else {
            // Если это обычный текст, конвертировать в HTML с поддержкой ссылок
            const htmlBody = this.convertTextToHtml(emailBody);
            bodyElement.innerHTML = htmlBody;
        }
        
        // Сделать все ссылки открывающимися в новой вкладке
        const links = bodyElement.querySelectorAll('a');
        links.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });

        modal.classList.add('active');
    }
    
    /**
     * Конвертировать текст в HTML с активными ссылками
     */
    convertTextToHtml(text) {
        // Экранировать HTML теги если это чистый текст
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Конвертировать URL в ссылки
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        html = html.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Конвертировать email в ссылки
        const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
        html = html.replace(emailPattern, '<a href="mailto:$1">$1</a>');
        
        // Конвертировать переносы строк в <br>
        html = html.replace(/\n/g, '<br>');
        
        return html;
    }

    /**
     * Настройка модальных окон
     */
    setupModals() {
        // Закрытие модальных окон
        document.getElementById('closeEmailModal').addEventListener('click', () => {
            document.getElementById('emailModal').classList.remove('active');
        });

        document.getElementById('closeAddKeyModal').addEventListener('click', () => {
            document.getElementById('addKeyModal').classList.remove('active');
        });

        // Закрытие по клику вне модального окна
        this.modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Добавление API ключа
        document.getElementById('confirmAddKeyBtn').addEventListener('click', () => {
            this.addApiKey();
        });
    }

    /**
     * Настройка настроек
     */
    setupSettings() {
        const addKeyBtn = document.getElementById('addApiKeyBtn');
        const autoRefreshToggle = document.getElementById('autoRefreshToggle');
        const refreshInterval = document.getElementById('refreshInterval');
        const refreshInboxBtn = document.getElementById('refreshInboxBtn');

        // Добавить ключ
        addKeyBtn.addEventListener('click', () => {
            document.getElementById('addKeyModal').classList.add('active');
        });

        // Автообновление
        autoRefreshToggle.addEventListener('change', (e) => {
            this.toggleAutoRefresh(e.target.checked);
            this.saveSettings();
        });

        // Интервал обновления
        refreshInterval.addEventListener('change', () => {
            this.saveSettings();
            if (autoRefreshToggle.checked) {
                this.toggleAutoRefresh(true);
            }
        });

        // Обновить входящие
        refreshInboxBtn.addEventListener('click', () => {
            this.refreshInbox();
        });
    }

    /**
     * Добавить API ключ
     */
    addApiKey() {
        const input = document.getElementById('newApiKey');
        const key = input.value.trim();

        if (!key) {
            this.showNotification('Введите ключ', 'error');
            return;
        }

        try {
            this.app.api.getKeyPool().addUserKey(key);
            
            input.value = '';
            document.getElementById('addKeyModal').classList.remove('active');
            
            this.showNotification(
                this.app.i18n.t('notifications.apiKeyAdded'),
                'success'
            );

            this.updateSettingsUI();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    /**
     * Удалить API ключ
     */
    removeApiKey(key) {
        if (confirm('Удалить этот ключ?')) {
            this.app.api.getKeyPool().removeUserKey(key);
            
            this.showNotification(
                this.app.i18n.t('notifications.apiKeyRemoved'),
                'success'
            );

            this.updateSettingsUI();
        }
    }

    /**
     * Обновить UI настроек
     */
    updateSettingsUI() {
        // Обновить список ключей
        const keysList = document.getElementById('apiKeysList');
        const keys = this.app.api.getKeyPool().getAllKeys();

        keysList.innerHTML = '';

        keys.forEach(keyData => {
            const keyItem = document.createElement('div');
            keyItem.className = 'api-key-item';
            if (!keyData.isExhausted) keyItem.classList.add('active');
            if (keyData.isExhausted) keyItem.classList.add('exhausted');

            const maskedKey = keyData.key.substring(0, 8) + '...' + keyData.key.substring(keyData.key.length - 4);

            keyItem.innerHTML = `
                <div class="api-key-info">
                    <div class="api-key-value">${maskedKey}</div>
                    <div class="api-key-usage">Использований: ${keyData.usageCount} ${keyData.isExhausted ? '(Исчерпан)' : ''}</div>
                </div>
                ${keyData.isUserKey ? `<button class="btn-remove" data-key="${keyData.key}">Удалить</button>` : ''}
            `;

            if (keyData.isUserKey) {
                keyItem.querySelector('.btn-remove').addEventListener('click', () => {
                    this.removeApiKey(keyData.key);
                });
            }

            keysList.appendChild(keyItem);
        });

        // Обновить статистику
        document.getElementById('totalInboxes').textContent = this.app.getInboxes().length;
        document.getElementById('totalEmails').textContent = this.app.getAllEmails().length;
        document.getElementById('activeKeys').textContent = this.app.api.getKeyPool().getActiveKeysCount();
    }

    /**
     * Переключить автообновление
     */
    toggleAutoRefresh(enabled) {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }

        if (enabled) {
            const interval = parseInt(document.getElementById('refreshInterval').value) * 1000;
            this.autoRefreshInterval = setInterval(() => {
                if (document.querySelector('.content-section#inbox').classList.contains('active')) {
                    this.refreshInbox();
                }
            }, interval);
        }
    }

    /**
     * Настройка переключателя языка
     */
    setupLanguageToggle() {
        const langToggle = document.getElementById('langToggle');
        
        langToggle.addEventListener('click', () => {
            this.app.i18n.toggleLanguage();
        });
    }

    /**
     * Показать уведомление
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icon = type === 'success' ? 'check-circle' : 
                     type === 'error' ? 'exclamation-circle' : 
                     'info-circle';

        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        this.notifications.appendChild(notification);

        // Автоматически удалить через 5 секунд
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    /**
     * Сохранить настройки
     */
    saveSettings() {
        const settings = {
            autoRefresh: document.getElementById('autoRefreshToggle').checked,
            refreshInterval: document.getElementById('refreshInterval').value
        };

        localStorage.setItem('settings', JSON.stringify(settings));
    }

    /**
     * Загрузить настройки
     */
    loadSettings() {
        const stored = localStorage.getItem('settings');
        if (stored) {
            try {
                const settings = JSON.parse(stored);
                document.getElementById('autoRefreshToggle').checked = settings.autoRefresh;
                document.getElementById('refreshInterval').value = settings.refreshInterval;

                if (settings.autoRefresh) {
                    this.toggleAutoRefresh(true);
                }
            } catch (error) {
                console.error('Ошибка загрузки настроек:', error);
            }
        }
    }
}

