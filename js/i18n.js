/**
 * Менеджер интернационализации
 * Управляет переводами и локализацией приложения
 */
class I18nManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'ru';
        this.translations = {
            ru: {
                app: {
                    title: 'MailSlurp'
                },
                nav: {
                    inbox: 'Входящие',
                    create: 'Создать почту',
                    generator: 'Генератор данных',
                    settings: 'Настройки'
                },
                create: {
                    title: 'Создать временную почту',
                    emailType: 'Тип почты:',
                    random: 'Случайный адрес',
                    custom: 'Свой адрес',
                    customEmail: 'Ваш адрес:',
                    lifetime: 'Время жизни:',
                    generate: 'Создать почту',
                    copy: 'Копировать',
                    expiresIn: 'Истекает через:'
                },
                inbox: {
                    title: 'Входящие сообщения',
                    empty: 'Нет сообщений. Создайте временную почту для получения писем.'
                },
                generator: {
                    title: 'Генератор данных',
                    firstName: 'Имя',
                    lastName: 'Фамилия',
                    username: 'Логин',
                    password: 'Пароль',
                    passwordLength: 'Длина пароля:',
                    generate: 'Генерировать',
                    generateAll: 'Сгенерировать всё'
                },
                settings: {
                    title: 'Настройки',
                    apiKeys: 'API ключи:',
                    addKey: 'Добавить ключ',
                    autoRefresh: 'Автообновление:',
                    refreshInterval: 'Интервал обновления (сек):',
                    totalInboxes: 'Всего почтовых ящиков',
                    totalEmails: 'Всего писем',
                    activeKeys: 'Активных ключей'
                },
                modal: {
                    from: 'От:',
                    to: 'Кому:',
                    date: 'Дата:',
                    addKeyTitle: 'Добавить API ключ',
                    apiKey: 'API ключ:',
                    add: 'Добавить'
                },
                notifications: {
                    emailCreated: 'Почтовый ящик успешно создан!',
                    emailCopied: 'Адрес скопирован в буфер обмена',
                    emailSent: 'Письмо успешно отправлено!',
                    emailExpired: 'Срок действия почты истек',
                    apiKeyAdded: 'API ключ добавлен',
                    apiKeyRemoved: 'API ключ удален',
                    error: 'Произошла ошибка',
                    errorCreating: 'Ошибка при создании почты',
                    errorSending: 'Ошибка при отправке письма',
                    errorLoading: 'Ошибка при загрузке писем',
                    fillAllFields: 'Заполните все поля',
                    invalidEmail: 'Неверный формат email'
                }
            },
            en: {
                app: {
                    title: 'MailSlurp'
                },
                nav: {
                    inbox: 'Inbox',
                    create: 'Create Email',
                    generator: 'Data Generator',
                    settings: 'Settings'
                },
                create: {
                    title: 'Create Temporary Email',
                    emailType: 'Email Type:',
                    random: 'Random Address',
                    custom: 'Custom Address',
                    customEmail: 'Your Address:',
                    lifetime: 'Lifetime:',
                    generate: 'Create Email',
                    copy: 'Copy',
                    expiresIn: 'Expires in:'
                },
                inbox: {
                    title: 'Inbox',
                    empty: 'No messages. Create a temporary email to receive letters.'
                },
                generator: {
                    title: 'Data Generator',
                    firstName: 'First Name',
                    lastName: 'Last Name',
                    username: 'Username',
                    password: 'Password',
                    passwordLength: 'Password Length:',
                    generate: 'Generate',
                    generateAll: 'Generate All'
                },
                settings: {
                    title: 'Settings',
                    apiKeys: 'API Keys:',
                    addKey: 'Add Key',
                    autoRefresh: 'Auto-refresh:',
                    refreshInterval: 'Refresh Interval (sec):',
                    totalInboxes: 'Total Inboxes',
                    totalEmails: 'Total Emails',
                    activeKeys: 'Active Keys'
                },
                modal: {
                    from: 'From:',
                    to: 'To:',
                    date: 'Date:',
                    addKeyTitle: 'Add API Key',
                    apiKey: 'API Key:',
                    add: 'Add'
                },
                notifications: {
                    emailCreated: 'Mailbox successfully created!',
                    emailCopied: 'Address copied to clipboard',
                    emailSent: 'Email successfully sent!',
                    emailExpired: 'Email has expired',
                    apiKeyAdded: 'API key added',
                    apiKeyRemoved: 'API key removed',
                    error: 'An error occurred',
                    errorCreating: 'Error creating email',
                    errorSending: 'Error sending email',
                    errorLoading: 'Error loading emails',
                    fillAllFields: 'Fill all fields',
                    invalidEmail: 'Invalid email format'
                }
            }
        };
    }

    /**
     * Получить текущий язык
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Установить язык
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            this.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Переключить язык
     */
    toggleLanguage() {
        const newLang = this.currentLanguage === 'ru' ? 'en' : 'ru';
        this.setLanguage(newLang);
    }

    /**
     * Получить перевод по ключу
     */
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                return key;
            }
        }
        
        return value;
    }

    /**
     * Обновить UI с новыми переводами
     */
    updateUI() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else if (element.tagName === 'OPTION') {
                element.textContent = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Обновить индикатор языка
        const currentLangElement = document.getElementById('currentLang');
        if (currentLangElement) {
            currentLangElement.textContent = this.currentLanguage.toUpperCase();
        }
    }

    /**
     * Инициализация
     */
    init() {
        this.updateUI();
    }
}

