# recursive-state-machine

This library implements a simple non blocking recursive state machine for node.js. Multiple tasks can be defined for a specific state and multiple states can be defined as well. Tasks are asynchronous functions and are isolated from each other, meaning that the result does not transit from task to task. It offers a lot of flexibility in the control flow and infinite loops are also valid.

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

Multiple states can be defined and it is possible to jump between them. States cannot be defined with the same name as the `terminateState`.

All errors thrown from the tasks will be handled by the `errorHandler`. The machine will resume in the state returned by the `errorHandler`. If nothing is returned, it terminates with result `1`.

The machine returns `0` when terminating in success and returns `1` when terminating in error (e.g if nothing is returned from the `errorHandler`). It can also throw an error if something is wrong inside the `errorHandler`.

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

## Installation
`npm install --save recursive-state-machine`

## Usage:
```
const { StateMachine } = require('recursive-state-machine');
```
or
```
import { StateMachine } from 'recursive-state-machine';
```
```
const stateMachine = StateMachine(config);
stateMachine.start();
```
with more control:
```
(async () => {
    const stateMachine = StateMachine(config);
    
    try {
        const result = await stateMachine.start();
        ...
    } catch (err) {
        ...
    }
})();
```