/**
 * Генератор данных
 * Генерирует случайные данные для приложения
 */
class DataGenerator {
    constructor() {
        this.emailPrefixes = [
            'user', 'test', 'demo', 'temp', 'inbox', 'mail', 'contact',
            'info', 'admin', 'support', 'hello', 'welcome'
        ];
        
        this.emailDomains = [
            'mailslurp.com', 'mailslurp.net', 'tempmail.dev'
        ];
        
        // Имена для генерации (английские)
        this.firstNames = [
            'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
            'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald',
            'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George',
            'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica',
            'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra', 'Ashley',
            'Dorothy', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol', 'Amanda', 'Melissa'
        ];
        
        this.lastNames = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
            'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
            'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
            'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
            'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
            'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell'
        ];
        
        this.usernameAdjectives = [
            'cool', 'super', 'mega', 'ultra', 'fast', 'smart', 'pro', 'epic',
            'dark', 'fire', 'ice', 'storm', 'shadow', 'ghost', 'ninja', 'cyber'
        ];
        
        this.usernameNouns = [
            'user', 'player', 'gamer', 'master', 'king', 'hero', 'warrior', 'hunter',
            'ninja', 'wizard', 'knight', 'dragon', 'tiger', 'wolf', 'eagle', 'lion'
        ];
    }

    /**
     * Генерировать случайную строку
     */
    generateRandomString(length = 10) {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Генерировать случайный email
     */
    generateRandomEmail() {
        const prefix = this.emailPrefixes[Math.floor(Math.random() * this.emailPrefixes.length)];
        const random = this.generateRandomString(8);
        const domain = this.emailDomains[0];
        return `${prefix}_${random}@${domain}`;
    }

    /**
     * Генерировать UUID (упрощенная версия)
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Форматировать дату
     */
    formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return date.toLocaleString('ru-RU', options);
    }

    /**
     * Форматировать время (таймер)
     */
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
        }
    }

    /**
     * Извлечь превью из текста письма
     */
    extractPreview(text, maxLength = 100) {
        if (!text) return '';
        
        // Удалить HTML теги
        const stripped = text.replace(/<[^>]*>/g, '');
        
        // Обрезать и добавить многоточие
        if (stripped.length > maxLength) {
            return stripped.substring(0, maxLength) + '...';
        }
        
        return stripped;
    }

    /**
     * Валидация email
     */
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Генерировать случайное имя файла
     */
    generateFilename(extension = 'txt') {
        const timestamp = Date.now();
        const random = this.generateRandomString(6);
        return `file_${timestamp}_${random}.${extension}`;
    }
    
    /**
     * Генерировать случайное имя
     */
    generateFirstName() {
        return this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
    }
    
    /**
     * Генерировать случайную фамилию
     */
    generateLastName() {
        return this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
    }
    
    /**
     * Генерировать логин/username
     */
    generateUsername() {
        const adjective = this.usernameAdjectives[Math.floor(Math.random() * this.usernameAdjectives.length)];
        const noun = this.usernameNouns[Math.floor(Math.random() * this.usernameNouns.length)];
        const number = Math.floor(Math.random() * 1000);
        return `${adjective}_${noun}${number}`;
    }
    
    /**
     * Генерировать безопасный пароль
     */
    generatePassword(length = 16) {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        const allChars = lowercase + uppercase + numbers + symbols;
        
        let password = '';
        
        // Гарантировать хотя бы по одному символу каждого типа
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        
        // Заполнить остальное случайными символами
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Перемешать пароль
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
    
    /**
     * Генерировать полное имя (имя + фамилия)
     */
    generateFullName() {
        return `${this.generateFirstName()} ${this.generateLastName()}`;
    }
}

