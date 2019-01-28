# state-machine

A simple state machine for node.js. It allows infinite loops by respecting node's event loop.

## Example of a configuration:

```
const config = {
    initialState: 'S1',
    terminateState: 'S3',
    states: {
        S1: {
            tasks: [
                {
                    name: 'task1',
                    task: task1,
                },
                {
                    name: 'task2',
                    task: task2,
                }, 
            ],
            nextState: 'S2',
        },
        S2: {
            tasks: [
                {
                    name: 'task3',
                    task: task3,
                },
                {
                    name: 'task4',
                    task: task4,
                },
            ],
            nextState: 'S3',
        },
    },
    errorHandler: ({ currentState, taskName, error }) => { ... },
    cleanupTasks: [
        {
            name: 'foo1',
            task: foo1,
        },
        {
            name: 'foo2',
            task: foo2,
        },
    ],
};
```

States can be defined as necessary and we can jump between states as needed. We cannot define states with the same name as the `terminateState`.

Inside our errorHandler you need to handle the error and return the state we want to go to. If we don't return anything, the machine will terminate.

Cleanup tasks are optional. They will always run on machine termination (regardless if it terminates in success or error state); E.g disconnecting from a database.

The error handler is of the form:
`({ currentState, taskName, error }) => { ... }`
We can return states to change the behaviour of the machine example:
```
({ currentState, taskName, error }) => { 
    if (error ...) {
        return 'S1';
    }
    ...

    // Terminate the machine
    return 'S3';
}
```

## Usage:

```
const stateMachine = StateMachine(config);
stateMachine.start();
```