# state-machine

## Examples of configuration:

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