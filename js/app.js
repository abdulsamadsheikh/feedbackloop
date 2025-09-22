const App = (function() {
    // --- State ---
    const state = {
        currentUser: null,
        userScores: {
            'Ola Nordmann': 5,
            'Kari Svendsen': 8,
            'Arne Jacobsen': 2,
        },
        insights: [] // { role, wish, goal, author, timestamp }
    };

    // --- DOM Elements ---
    const ui = {
        loginContainer: null,
        appContainer: null,
        loginForm: null,
        usernameInput: null,
        logoutButton: null,
        welcomeMessage: null,
        insightForm: null,
        roleInput: null,
        wishInput: null,
        goalInput: null,
        leaderboardDiv: null,
        insightsList: null,
        insightsCount: null,
    };

    /**
     * Initializes the application by caching DOM elements.
     */
    function init() {
        ui.loginContainer = document.getElementById('login-container');
        ui.appContainer = document.getElementById('app-container');
        ui.loginForm = document.getElementById('login-form');
        ui.usernameInput = document.getElementById('username');
        ui.logoutButton = document.getElementById('logout-button');
        ui.welcomeMessage = document.getElementById('welcome-message');
        ui.insightForm = document.getElementById('insight-form');
        ui.roleInput = document.getElementById('role');
        ui.wishInput = document.getElementById('wish');
        ui.goalInput = document.getElementById('goal');
        ui.leaderboardDiv = document.getElementById('leaderboard');
        ui.insightsList = document.getElementById('insights-list');
        ui.insightsCount = document.getElementById('insights-count');

        // --- Event Listeners ---
        if (ui.loginForm) {
            ui.loginForm.addEventListener('submit', handleLogin);
        }
        if (ui.logoutButton) {
            ui.logoutButton.addEventListener('click', handleLogout);
        }
        if (ui.insightForm) {
            ui.insightForm.addEventListener('submit', handleInsightSubmit);
        }

        loadFromStorage();

        // If a user was logged in previously, show app directly
        const storedUser = localStorage.getItem('fl_current_user');
        if (storedUser) {
            state.currentUser = storedUser;
            updateUIForLogin();
        }

        renderLeaderboard();
        renderInsights();
    }

    /**
     * Renders the leaderboard based on the current state.
     */
    function renderLeaderboard() {
        const { userScores } = state;
        if (!ui.leaderboardDiv) return;
        ui.leaderboardDiv.innerHTML = ''; // Clear previous entries

        const sortedUsers = Object.entries(userScores).sort(([, a], [, b]) => b - a);

        if (sortedUsers.length === 0) {
            ui.leaderboardDiv.innerHTML = '<p class="text-gray-500">Ingen innsikter er logget ennå.</p>';
            return;
        }

        sortedUsers.forEach(([name, score], index) => {
            const rank = index + 1;
            let medal = '';
            if (rank === 1) medal = '🥇'; // Gold
            if (rank === 2) medal = '🥈'; // Silver
            if (rank === 3) medal = '🥉'; // Bronze

            const entryDiv = document.createElement('div');
            entryDiv.className = 'flex items-center justify-between bg-gray-700/50 p-3 rounded-md transition-all duration-300';
            entryDiv.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="font-bold text-lg w-6 text-center">${medal || rank}</span>
                    <span class="font-medium">${name}</span>
                </div>
                <span class="font-bold text-indigo-400">${score} poeng</span>
            `;
            ui.leaderboardDiv.appendChild(entryDiv);
        });
    }

    /**
     * Handles user login.
     * @param {Event} event
     */
    function handleLogin(event) {
        event.preventDefault();
        const username = ui.usernameInput.value.trim();
        if (username) {
            loginUser(username);
            updateUIForLogin();
            saveToStorage();
            renderLeaderboard();
        }
    }

    /**
     * Handles user logout.
     */
    function handleLogout() {
        logoutUser();
        updateUIForLogout();
        saveToStorage();
    }

    /**
     * Handles submission of a new insight.
     * @param {Event} event
     */
    function handleInsightSubmit(event) {
        event.preventDefault();
        const role = ui.roleInput.value.trim();
        const wish = ui.wishInput.value.trim();
        const goal = ui.goalInput.value.trim();

        if (role && wish && goal && state.currentUser) {
            addInsight(role, wish, goal);
            ui.roleInput.value = '';
            ui.wishInput.value = '';
            ui.goalInput.value = '';
            renderLeaderboard();
            renderInsights();
            alert('Takk! Din innsikt er registrert.');
        }
    }

    /**
     * Updates the UI to show the main application view.
     */
    function updateUIForLogin() {
        if (!ui.welcomeMessage || !ui.loginContainer || !ui.appContainer || !ui.usernameInput) return;
        ui.welcomeMessage.textContent = `Velkommen, ${state.currentUser}!`;
        ui.loginContainer.classList.add('hidden');
        ui.appContainer.classList.remove('hidden');
        ui.usernameInput.value = '';
    }

    /**
     * Updates the UI to show the login view.
     */
    function updateUIForLogout() {
        if (!ui.appContainer || !ui.loginContainer) return;
        ui.appContainer.classList.add('hidden');
        ui.loginContainer.classList.remove('hidden');
    }

    // --- Pure Functions for Testing ---

    function loginUser(username) {
        state.currentUser = username;
        if (!state.userScores[state.currentUser]) {
            state.userScores[state.currentUser] = 0;
        }
        localStorage.setItem('fl_current_user', state.currentUser);
        return state;
    }

    function logoutUser() {
        state.currentUser = null;
        localStorage.removeItem('fl_current_user');
        return state;
    }

    function addInsight(role, wish, goal) {
        if (role && wish && goal && state.currentUser) {
            state.userScores[state.currentUser]++;
            state.insights.unshift({
                role,
                wish,
                goal,
                author: state.currentUser,
                timestamp: Date.now()
            });
            saveToStorage();
            console.log(`Ny innsikt fra ${state.currentUser}:`);
            console.log(`  Som en: ${role}`);
            console.log(`  Ønsker jeg: ${wish}`);
            console.log(`  Slik at: ${goal}`);
        }
        return state;
    }

    /**
     * Renders the insights feed.
     */
    function renderInsights() {
        if (!ui.insightsList || !ui.insightsCount) return;
        const items = state.insights;
        ui.insightsList.innerHTML = '';

        ui.insightsCount.textContent = items.length > 0 ? `${items.length} histor${items.length === 1 ? 'ie' : 'ier'}` : '';

        if (items.length === 0) {
            ui.insightsList.innerHTML = '<p class="text-gray-400">Ingen historier er logget ennå. Vær den første til å bidra! ✨</p>';
            return;
        }

        items.forEach(item => {
            const date = new Date(item.timestamp);
            const formatted = date.toLocaleString('no-NO', { dateStyle: 'medium', timeStyle: 'short' });
            const div = document.createElement('div');
            div.className = 'insight-item';
            div.innerHTML = `
                <div class="text-sm insight-meta">Av <span class="text-indigo-300 font-medium">${escapeHtml(item.author)}</span> • ${formatted}</div>
                <div class="mt-2">
                    <p><span class="text-gray-300">Som en</span> <span class="font-medium">${escapeHtml(item.role)}</span>,</p>
                    <p class="mt-1"><span class="text-gray-300">ønsker jeg</span> <span class="font-medium">${escapeHtml(item.wish)}</span>,</p>
                    <p class="mt-1"><span class="text-gray-300">slik at</span> <span class="font-medium">${escapeHtml(item.goal)}</span>.</p>
                </div>
            `;
            ui.insightsList.appendChild(div);
        });
    }

    /**
     * Persist state to localStorage
     */
    function saveToStorage() {
        try {
            localStorage.setItem('fl_user_scores', JSON.stringify(state.userScores));
            localStorage.setItem('fl_insights', JSON.stringify(state.insights));
        } catch (e) {
            console.warn('Kunne ikke lagre til localStorage', e);
        }
    }

    /**
     * Load state from localStorage
     */
    function loadFromStorage() {
        try {
            const scores = localStorage.getItem('fl_user_scores');
            const insights = localStorage.getItem('fl_insights');
            if (scores) {
                state.userScores = { ...state.userScores, ...JSON.parse(scores) };
            }
            if (insights) {
                const parsed = JSON.parse(insights);
                if (Array.isArray(parsed)) state.insights = parsed;
            }
        } catch (e) {
            console.warn('Kunne ikke laste fra localStorage', e);
        }
    }

    // Basic HTML escaping for safety
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // --- Event Listener Setup ---
    document.addEventListener('DOMContentLoaded', init);

    // --- Public API for Testing ---
    return {
        init,
        getState: () => state,
        loginUser,
        logoutUser,
        addInsight
    };
})();