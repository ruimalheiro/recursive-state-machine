module.exports.StateMachine = function ({
    initialState,
    terminateState,
    states,
    errorHandler,
    cleanupTasks = [],
}) {

    if (!initialState) {
        throw new Error('initialState missing');
    }

    if (!terminateState) {
        throw new Error('terminateState missing');
    }

    if (!states) {
        throw new Error('Missing states property');
    }

    if (Object.keys(states).length === 0) {
        throw new Error('State definition is missing');
    }

    const stateList = Object.keys(states);
    for (const key of stateList) {
        if (key === terminateState) {
            throw Error(`State '${terminateState}' is reserved for machine termination`);
        }

        const state = states[key];

        if (!state.tasks || !Array.isArray(state.tasks)) {
            throw new Error(`Missing 'tasks' property for state: ${key}`);
        }

        for (const taskObject of state.tasks) {
            if (!taskObject || !taskObject.name || !taskObject.task) {
                throw new Error(`Invalid task in state: ${key}. Tasks must me of the form: '{ name: 'foo', task: foo }'`);
            }
        }

        if (!state.nextState) {
            throw new Error(`Missing 'nextState' property for state: ${key}`);
        }

        if (state.nextState !== terminateState && !stateList.includes(state.nextState)) {
            throw new Error(`'nextState' is invalid for state: ${key}`);
        }
    }

    if (!errorHandler) {
        throw new Error('Missing errorHandler property');
    }

    if (!Array.isArray(cleanupTasks)) {
        throw new Error('Invalid cleanupTasks property. Must be an array of functions');
    }

    for (const taskObject of cleanupTasks) {
        if (!taskObject || !taskObject.name || !taskObject.task) {
            throw new Error(`Invalid cleanupTask. Tasks must me of the form: '{ name: 'foo', task: foo }'`);
        }
    }

    const _terminateState = terminateState;
    const _errorHandler = errorHandler;
    const _states = states;
    const _cleanupTasks = cleanupTasks;

    let _currentState = initialState;
    let _currentTaskName;
    let _exitCode = 0;
    let _innerError;

    const machine = async callback => {
        try {

            if (_currentState === _terminateState) {
                for (const taskObject of _cleanupTasks) {
                    _currentTaskName = taskObject.name;
                    await taskObject.task();
                }
                callback(_exitCode, _innerError);
                return null;
            }

            const state = _states[_currentState];

            if (!state) {
                throw new Error(`State '${_currentState}' is missing in the configuration`);
            }

            for (const taskObject of state.tasks) {
                _currentTaskName = taskObject.name;
                await taskObject.task();
            }

            _currentState = state.nextState;

        } catch (error) {
            try {
                _currentState = _errorHandler({
                    error,
                    currentState: _currentState,
                    taskName: _currentTaskName,
                });
            } catch (error) {
                _currentState = _terminateState;
                _innerError = error;
            }

            if (!_currentState || !_states[_currentState]) {
                _currentState = _terminateState;
            }

            if (_currentState === _terminateState) {
                _exitCode = 1;
            }
        }

        process.nextTick(() => machine(callback));
    };

    const start = async () => new Promise((resolve, reject) => {
        machine((result, error) => {
            if (error) {
                reject(error);
            } else {
                resolve(result)
            }
        });
    });

    return {
        start,
    };
};