// Variables globales
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks')) || {};
let currentView = 'welcome';
let currentTheme = localStorage.getItem('theme') || 'default';
let currentCategory = 'nature';
let viewHistory = []; // Historique de navigation

// Gestionnaire de sons de notification
class NotificationSounds {
    constructor() {
        this.sounds = {
            default: null, // Son par défaut du navigateur
            bell: this.createSynthSound(800, 0.3, 'triangle'),
            chime: this.createChimeSound(),
            notification: this.createSynthSound(440, 0.5, 'sine'),
            piano: this.createPianoSound(),
            beep: this.createSynthSound(1000, 0.2, 'square')
        };
    }

    createSynthSound(frequency, duration, type = 'sine') {
        return () => {
            if (!window.AudioContext && !window.webkitAudioContext) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    }

    createChimeSound() {
        return () => {
            if (!window.AudioContext && !window.webkitAudioContext) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const frequencies = [523.25, 659.25, 783.99]; // Do, Mi, Sol
            
            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = freq;
                oscillator.type = 'sine';

                const startTime = audioContext.currentTime + index * 0.2;
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.5);
            });
        };
    }

    createPianoSound() {
        return () => {
            if (!window.AudioContext && !window.webkitAudioContext) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 261.63; // Do central
            oscillator.type = 'triangle';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1.5);
        };
    }

    play(soundType = 'default') {
        if (soundType === 'default') {
            // Utiliser le son par défaut du navigateur (aucun son synthétique)
            return;
        }
        
        const sound = this.sounds[soundType];
        if (sound) {
            try {
                sound();
            } catch (error) {
                console.warn('Erreur lors de la lecture du son:', error);
            }
        }
    }
}

// Instance globale du gestionnaire de sons
const notificationSounds = new NotificationSounds();

// Définition des thèmes par catégorie
const themeCategories = {
    nature: [
        { name: 'Forêt', theme: 'nature', preview: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)' },
        { name: 'Océan', theme: 'ocean', preview: 'linear-gradient(135deg, #667db6 0%, #0082c8 100%)' },
        { name: 'Montagne', theme: 'mountain', preview: 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)' },
        { name: 'Coucher de soleil', theme: 'sunset', preview: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' }
    ],
    science: [
        { name: 'Espace', theme: 'space', preview: 'linear-gradient(135deg, #000428 0%, #004e92 100%)' },
        { name: 'Laboratoire', theme: 'science', preview: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)' },
        { name: 'Néon', theme: 'neon', preview: 'linear-gradient(135deg, #00f260 0%, #0575e6 100%)' },
        { name: 'Chimie', theme: 'chemistry', preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
    ],
    histoire: [
        { name: 'Antique', theme: 'histoire', preview: 'linear-gradient(135deg, #d7ccc8 0%, #a1887f 100%)' },
        { name: 'Médiéval', theme: 'medieval', preview: 'linear-gradient(135deg, #8d6e63 0%, #5d4037 100%)' },
        { name: 'Renaissance', theme: 'renaissance', preview: 'linear-gradient(135deg, #dce35b 0%, #45b649 100%)' },
        { name: 'Victorien', theme: 'victorian', preview: 'linear-gradient(135deg, #b79891 0%, #94716b 100%)' }
    ],
    arts: [
        { name: 'Pastel', theme: 'arts', preview: 'linear-gradient(135deg, #f8bbd9 0%, #e1bee7 100%)' },
        { name: 'Pop Art', theme: 'popart', preview: 'linear-gradient(135deg, #ff006e 0%, #ffbe0b 100%)' },
        { name: 'Aquarelle', theme: 'watercolor', preview: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
        { name: 'Moderne', theme: 'modern', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
    ],
    culture: [
        { name: 'Japonais', theme: 'japanese', preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
        { name: 'Africain', theme: 'african', preview: 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)' },
        { name: 'Indien', theme: 'indian', preview: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
        { name: 'Nordique', theme: 'nordic', preview: 'linear-gradient(135deg, #a8caba 0%, #5d4e75 100%)' }
    ],
    couleurs: [
        { name: 'Bleu', theme: 'blue', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { name: 'Rose', theme: 'pink', preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
        { name: 'Vert', theme: 'green', preview: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)' },
        { name: 'Orange', theme: 'orange', preview: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' },
        { name: 'Violet', theme: 'purple', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { name: 'Sombre', theme: 'dark', preview: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' }
    ]
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeDatePickers();
    loadTheme();
    loadWeeklyTasks();
    updateStats();
    requestNotificationPermission();
    loadSettings();
});

function initializeApp() {
    showView('welcome');
}

function loadSettings() {
    // Charger les paramètres sauvegardés
    const savedSound = localStorage.getItem('notificationSound') || 'default';
    const savedReminderTime = localStorage.getItem('reminderTime') || '15';
    
    document.getElementById('notification-sound').value = savedSound;
    document.getElementById('reminder-time').value = savedReminderTime;
}

function setupEventListeners() {
    // Bouton de démarrage
    document.getElementById('start-btn').addEventListener('click', function() {
        showView('tasks');
        document.getElementById('floating-menu').classList.remove('hidden');
    });

    // Menu flottant
    const menuToggle = document.querySelector('.menu-toggle');
    const floatingMenu = document.getElementById('floating-menu');
    
    menuToggle.addEventListener('click', function() {
        floatingMenu.classList.toggle('active');
    });

    // Items du menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const view = this.dataset.view;
            showView(view);
            floatingMenu.classList.remove('active');
        });
    });

    // Fermer le menu en cliquant ailleurs
    document.addEventListener('click', function(e) {
        if (!floatingMenu.contains(e.target)) {
            floatingMenu.classList.remove('active');
        }
    });

    // Catégories de thèmes
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            renderThemes();
        });
    });

    // Entrée avec Enter
    document.getElementById('todo-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // Paramètres de notification
    document.getElementById('notification-sound').addEventListener('change', function() {
        localStorage.setItem('notificationSound', this.value);
    });

    document.getElementById('reminder-time').addEventListener('change', function() {
        localStorage.setItem('reminderTime', this.value);
    });

    document.getElementById('test-sound').addEventListener('click', function() {
        const selectedSound = document.getElementById('notification-sound').value;
        notificationSounds.play(selectedSound);
        showNotification('Test de la sonnerie sélectionnée', 'info');
    });

    // Bouton de retour
    document.getElementById('back-button').addEventListener('click', function() {
        goBack();
    });
}

function initializeDatePickers() {
    // Configuration Flatpickr pour les dates
    const dateConfig = {
        locale: 'fr',
        dateFormat: 'd/m/Y H:i',
        enableTime: true,
        time_24hr: true,
        allowInput: true
    };

    // Date picker pour date de début
    flatpickr('#start-date', {
        ...dateConfig,
        onChange: function(selectedDates, dateStr) {
            // Mettre à jour automatiquement la date de fin si elle est antérieure
            const endDatePicker = document.getElementById('end-date')._flatpickr;
            if (endDatePicker && selectedDates[0] && endDatePicker.selectedDates[0]) {
                if (selectedDates[0] > endDatePicker.selectedDates[0]) {
                    endDatePicker.setDate(selectedDates[0]);
                }
            }
        }
    });

    // Date picker pour date de fin
    flatpickr('#end-date', dateConfig);

    // Ajout des événements pour les icônes calendrier
    document.querySelectorAll('.date-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            if (input._flatpickr) {
                input._flatpickr.open();
            }
        });
    });
}

function showView(viewName, addToHistory = true) {
    // Ajouter à l'historique si ce n'est pas un retour en arrière
    if (addToHistory && currentView !== viewName) {
        viewHistory.push(currentView);
    }

    // Cacher toutes les vues
    document.querySelectorAll('.view, .welcome-container').forEach(view => {
        view.classList.add('hidden');
    });

    // Afficher la vue demandée
    if (viewName === 'welcome') {
        document.getElementById('welcome-page').classList.remove('hidden');
        // Cacher le bouton de retour sur la page de bienvenue
        document.getElementById('back-button').classList.add('hidden');
    } else {
        document.getElementById(`${viewName}-view`).classList.remove('hidden');
        // Afficher le bouton de retour sur toutes les autres vues
        document.getElementById('back-button').classList.remove('hidden');
        
        // Actions spécifiques par vue
        switch(viewName) {
            case 'tasks':
                renderTodos();
                initializeDatePickers();
                break;
            case 'planning':
                renderWeeklyTasks();
                break;
            case 'themes':
                renderThemes();
                break;
            case 'stats':
                updateStats();
                drawProgressChart();
                break;
        }
    }
    
    currentView = viewName;
}

function goBack() {
    if (viewHistory.length > 0) {
        const previousView = viewHistory.pop();
        showView(previousView, false); // false pour ne pas ajouter à l'historique
    } else {
        // Si pas d'historique, retourner à la vue des tâches
        showView('tasks', false);
    }
}

// Fonctions pour les tâches
function addTodo() {
    const input = document.getElementById('todo-input');
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    if (input.value.trim() === '') {
        showNotification('Veuillez entrer une tâche', 'warning');
        return;
    }

    const todo = {
        id: Date.now(),
        text: input.value.trim(),
        startDate: startDate || null,
        endDate: endDate || null,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(todo);
    saveTodos();
    renderTodos();
    updateStats();

    // Réinitialiser les champs
    input.value = '';
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';

    showNotification('Tâche ajoutée avec succès!', 'success');

    // Notification si date de fin définie
    if (endDate) {
        scheduleNotification(todo);
    }
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    if (!todoList) return;
    
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        const dateInfo = [];
        if (todo.startDate) dateInfo.push(`Début: ${todo.startDate}`);
        if (todo.endDate) dateInfo.push(`Fin: ${todo.endDate}`);
        
        li.innerHTML = `
            <div class="todo-content">
                <div class="todo-text">${todo.text}</div>
                ${dateInfo.length > 0 ? `<div class="todo-dates">${dateInfo.join(' | ')}</div>` : ''}
            </div>
            <div class="todo-actions">
                <button class="btn-icon btn-complete" onclick="toggleTodo(${todo.id})" title="Marquer comme ${todo.completed ? 'non ' : ''}terminé">
                    <i class="fas ${todo.completed ? 'fa-undo' : 'fa-check'}"></i>
                </button>
                <button class="btn-icon btn-edit" onclick="editTodo(${todo.id})" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteTodo(${todo.id})" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        todoList.appendChild(li);
    });
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        if (todo.completed) {
            showNotification('Tâche terminée! 🎉', 'success');
        }
        saveTodos();
        renderTodos();
        updateStats();
    }
}

function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        const newText = prompt('Modifier la tâche:', todo.text);
        if (newText !== null && newText.trim() !== '') {
            todo.text = newText.trim();
            saveTodos();
            renderTodos();
            showNotification('Tâche modifiée!', 'success');
        }
    }
}

function deleteTodo(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        renderTodos();
        updateStats();
        showNotification('Tâche supprimée!', 'info');
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Fonctions pour le planning hebdomadaire
function addDayTask(day) {
    const task = prompt(`Ajouter une tâche pour ${day}:`);
    if (task && task.trim()) {
        if (!weeklyTasks[day]) {
            weeklyTasks[day] = [];
        }
        weeklyTasks[day].push({
            id: Date.now(),
            text: task.trim(),
            completed: false
        });
        saveWeeklyTasks();
        renderWeeklyTasks();
        showNotification(`Tâche ajoutée pour ${day}!`, 'success');
    }
}

function deleteDayTask(day, taskId) {
    if (weeklyTasks[day]) {
        weeklyTasks[day] = weeklyTasks[day].filter(task => task.id !== taskId);
        saveWeeklyTasks();
        renderWeeklyTasks();
    }
}

function renderWeeklyTasks() {
    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    
    days.forEach(day => {
        const container = document.getElementById(`tasks-${day}`);
        if (!container) return;
        
        container.innerHTML = '';
        
        if (weeklyTasks[day] && weeklyTasks[day].length > 0) {
            weeklyTasks[day].forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = 'day-task-item';
                taskElement.innerHTML = `
                    ${task.text}
                    <button class="delete-day-task" onclick="deleteDayTask('${day}', ${task.id})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                container.appendChild(taskElement);
            });
        }
    });
}

function loadWeeklyTasks() {
    weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks')) || {};
}

function saveWeeklyTasks() {
    localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks));
}

// Fonctions pour les thèmes
function renderThemes() {
    const themeGrid = document.getElementById('theme-grid');
    const customPanel = document.getElementById('custom-theme-panel');
    
    if (!themeGrid) return;
    
    if (currentCategory === 'custom') {
        themeGrid.style.display = 'none';
        customPanel.classList.remove('hidden');
        return;
    }
    
    themeGrid.style.display = 'grid';
    customPanel.classList.add('hidden');
    themeGrid.innerHTML = '';
    
    const themes = themeCategories[currentCategory] || [];
    
    themes.forEach(theme => {
        const themeCard = document.createElement('div');
        themeCard.className = `theme-card ${currentTheme === theme.theme ? 'active' : ''}`;
        themeCard.dataset.theme = theme.theme;
        
        themeCard.innerHTML = `
            <div class="theme-preview" style="background: ${theme.preview}"></div>
            <div class="theme-name">${theme.name}</div>
        `;
        
        themeCard.addEventListener('click', function() {
            applyTheme(theme.theme);
        });
        
        themeGrid.appendChild(themeCard);
    });
}

function applyTheme(themeName) {
    // Supprimer les anciennes classes de thème
    document.body.classList.remove('theme-default', 'theme-dark', 'theme-nature', 'theme-ocean', 'theme-science', 'theme-histoire', 'theme-arts');
    
    // Ajouter la nouvelle classe de thème
    if (themeName !== 'default') {
        document.body.classList.add(`theme-${themeName}`);
    }
    
    currentTheme = themeName;
    localStorage.setItem('theme', themeName);
    
    // Mettre à jour les cartes de thème
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.remove('active');
        if (card.dataset.theme === themeName) {
            card.classList.add('active');
        }
    });
    
    showNotification('Thème appliqué!', 'success');
}

function applyCustomTheme() {
    const primaryColor = document.getElementById('primary-color').value;
    const secondaryColor = document.getElementById('secondary-color').value;
    const bgColor = document.getElementById('bg-color').value;
    
    // Créer les variables CSS personnalisées
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--secondary-color', secondaryColor);
    root.style.setProperty('--bg-color', `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`);
    
    // Sauvegarder le thème personnalisé
    const customTheme = { primaryColor, secondaryColor, bgColor };
    localStorage.setItem('customTheme', JSON.stringify(customTheme));
    currentTheme = 'custom';
    localStorage.setItem('theme', 'custom');
    
    showNotification('Thème personnalisé appliqué!', 'success');
}

function loadTheme() {
    if (currentTheme === 'custom') {
        const customTheme = JSON.parse(localStorage.getItem('customTheme'));
        if (customTheme) {
            const root = document.documentElement;
            root.style.setProperty('--primary-color', customTheme.primaryColor);
            root.style.setProperty('--secondary-color', customTheme.secondaryColor);
            root.style.setProperty('--bg-color', `linear-gradient(135deg, ${customTheme.primaryColor} 0%, ${customTheme.secondaryColor} 100%)`);
        }
    } else {
        applyTheme(currentTheme);
    }
}

// Fonctions pour les statistiques
function updateStats() {
    const completedTasks = todos.filter(t => t.completed).length;
    const pendingTasks = todos.filter(t => !t.completed).length;
    
    // Calculer les tâches de la semaine
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    const weekCompleted = todos.filter(todo => {
        if (!todo.completed) return false;
        const completedDate = new Date(todo.createdAt);
        return completedDate >= weekStart;
    }).length;
    
    // Calculer la série actuelle
    let currentStreak = 0;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(Date.now() - (i * oneDayMs));
        const dateStr = checkDate.toDateString();
        
        const hasCompletedTask = todos.some(todo => {
            if (!todo.completed) return false;
            const completedDate = new Date(todo.createdAt);
            return completedDate.toDateString() === dateStr;
        });
        
        if (hasCompletedTask) {
            currentStreak++;
        } else if (i > 0) {
            break;
        }
    }
    
    // Mettre à jour l'affichage
    const completedElement = document.getElementById('completed-tasks');
    const pendingElement = document.getElementById('pending-tasks');
    const streakElement = document.getElementById('current-streak');
    const weekElement = document.getElementById('week-completed');
    
    if (completedElement) completedElement.textContent = completedTasks;
    if (pendingElement) pendingElement.textContent = pendingTasks;
    if (streakElement) streakElement.textContent = currentStreak;
    if (weekElement) weekElement.textContent = weekCompleted;
}

function drawProgressChart() {
    const canvas = document.getElementById('progress-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Nettoyer le canvas
    ctx.clearRect(0, 0, width, height);
    
    // Données des 7 derniers jours
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
        const dateStr = date.toDateString();
        const completed = todos.filter(todo => {
            if (!todo.completed) return false;
            const completedDate = new Date(todo.createdAt);
            return completedDate.toDateString() === dateStr;
        }).length;
        data.push(completed);
    }
    
    // Dessiner le graphique
    const maxValue = Math.max(...data, 1);
    const barWidth = width / 7;
    
    ctx.fillStyle = '#667eea';
    data.forEach((value, index) => {
        const barHeight = (value / maxValue) * (height - 40);
        const x = index * barWidth + 10;
        const y = height - barHeight - 20;
        
        ctx.fillRect(x, y, barWidth - 20, barHeight);
        
        // Ajouter les valeurs
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value.toString(), x + (barWidth - 20) / 2, y - 5);
        
        ctx.fillStyle = '#667eea';
    });
}

// Fonctions pour les notifications
function showNotification(message, type = 'info') {
    const banner = document.getElementById('notification-banner');
    const text = document.querySelector('.notification-text');
    const icon = document.querySelector('.notification-icon');
    
    if (!banner || !text || !icon) return;
    
    // Définir l'icône selon le type
    const icons = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    };
    
    icon.className = `fas ${icons[type] || icons.info} notification-icon`;
    text.textContent = message;
    
    banner.classList.add('show');
    
    // Masquer automatiquement après 3 secondes
    setTimeout(() => {
        banner.classList.remove('show');
    }, 3000);
}

function hideNotification() {
    const banner = document.getElementById('notification-banner');
    if (banner) {
        banner.classList.remove('show');
    }
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function scheduleNotification(todo) {
    if (!todo.endDate || Notification.permission !== 'granted') return;
    
    const endDate = new Date(todo.endDate);
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();
    const reminderTime = parseInt(localStorage.getItem('reminderTime') || '15') * 60 * 1000;
    
    if (timeDiff > reminderTime) {
        setTimeout(() => {
            // Jouer le son sélectionné
            const selectedSound = localStorage.getItem('notificationSound') || 'default';
            notificationSounds.play(selectedSound);
            
            // Afficher la notification système
            new Notification('Rappel To-Do', {
                body: `La tâche "${todo.text}" se termine bientôt !`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%234CAF50" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
            });
        }, timeDiff - reminderTime);
    }
}

// Fonctions pour les paramètres
function exportData() {
    const data = {
        todos: todos,
        weeklyTasks: weeklyTasks,
        theme: currentTheme,
        customTheme: JSON.parse(localStorage.getItem('customTheme') || 'null')
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'todo-backup.json';
    link.click();
    
    showNotification('Données exportées!', 'success');
}

function importData() {
    document.getElementById('import-file').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.todos) todos = data.todos;
            if (data.weeklyTasks) weeklyTasks = data.weeklyTasks;
            if (data.theme) currentTheme = data.theme;
            if (data.customTheme) localStorage.setItem('customTheme', JSON.stringify(data.customTheme));
            
            saveTodos();
            saveWeeklyTasks();
            localStorage.setItem('theme', currentTheme);
            
            loadTheme();
            renderTodos();
            renderWeeklyTasks();
            updateStats();
            
            showNotification('Données importées avec succès!', 'success');
        } catch (error) {
            showNotification('Erreur lors de l\'importation!', 'error');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.')) {
        localStorage.clear();
        todos = [];
        weeklyTasks = {};
        currentTheme = 'default';
        
        renderTodos();
        renderWeeklyTasks();
        updateStats();
        loadTheme();
        
        showNotification('Toutes les données ont été effacées!', 'info');
    }
}

// Animation de chargement
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Fonctions héritées (pour compatibilité)
function toggleFloatingMenu() {
    const menu = document.getElementById('floating-menu');
    menu.classList.toggle('active');
}

function updateWeeklyPlanning() {
    renderWeeklyTasks();
}