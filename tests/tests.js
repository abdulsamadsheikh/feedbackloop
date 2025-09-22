QUnit.module('FeedbackLoop Tests', function(hooks) {

    hooks.beforeEach(function() {
        // Reset the state before each test
        App.loginUser('Test User'); // Log in a default user for tests
        const state = App.getState();
        state.userScores = {
            'Ola Nordmann': 5,
            'Kari Svendsen': 8,
            'Arne Jacobsen': 2,
        };
    });

    QUnit.test('loginUser - existing user', function(assert) {
        const state = App.loginUser('Ola Nordmann');
        assert.equal(state.currentUser, 'Ola Nordmann', 'Current user should be set');
        assert.equal(state.userScores['Ola Nordmann'], 5, 'Existing user score should be unchanged');
    });

    QUnit.test('loginUser - new user', function(assert) {
        const state = App.loginUser('Nye Bruker');
        assert.equal(state.currentUser, 'Nye Bruker', 'Current user should be set');
        assert.equal(state.userScores['Nye Bruker'], 0, 'New user score should be initialized to 0');
    });

    QUnit.test('logoutUser', function(assert) {
        const state = App.logoutUser();
        assert.equal(state.currentUser, null, 'Current user should be null after logout');
    });

    QUnit.test('addInsight - valid insight', function(assert) {
        App.loginUser('Kari Svendsen');
        const state = App.addInsight('Role', 'Wish', 'Goal');
        assert.equal(state.userScores['Kari Svendsen'], 9, 'User score should be incremented');
    });

    QUnit.test('addInsight - empty insight', function(assert) {
        App.loginUser('Kari Svendsen');
        const state = App.addInsight('', '', '');
        assert.equal(state.userScores['Kari Svendsen'], 8, 'User score should not be incremented for empty insight');
    });

    QUnit.test('addInsight - no user', function(assert) {
        App.logoutUser();
        const state = App.addInsight('Role', 'Wish', 'Goal');
        // We need to check that no scores were changed
        const initialScores = {
            'Ola Nordmann': 5,
            'Kari Svendsen': 8,
            'Arne Jacobsen': 2,
        };
        assert.deepEqual(state.userScores, initialScores, 'Scores should not change when no user is logged in');
    });
});
