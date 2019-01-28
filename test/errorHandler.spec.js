const chai = require("chai");
const sinon = require("sinon");

chai.use(require("sinon-chai"));
chai.use(require("chai-as-promised"));

const expect = chai.expect;

const { StateMachine } = require('../lib/index');

const getMachineConfig = () => ({
    initialState: 'S1',
    terminateState: 'TERMINATE',
    states: {
        S1: {
            task: undefined,
            tasks: undefined,
            nextState: 'S2',
        },
        S2: {
            task: undefined,
            tasks: undefined,
            nextState: 'TERMINATE',
        },
    },
    errorHandler: ({ currentState, taskName, error }) => {},
    cleanupTasks: undefined,
});

const task = { name: 'task', task: () => {} };
const taskError = {
    name: 'error',
    task: () => {
        throw new Error('error');
    }
};

describe('StateMachine error handling', () => {
    it('should terminate with exitCode 0 if error from task is handled and returns a valid resume state', done => {
        const machineConfig = getMachineConfig();
        machineConfig.states.S1.tasks = [ taskError ];
        machineConfig.states.S2.tasks = [ task ];
        machineConfig.errorHandler = () => 'S2';
        const stateMachine = StateMachine(machineConfig);
        expect(stateMachine.start()).to.eventually.be.equal(0).and.notify(done);
    });

    it('should terminate with exitCode 1 if task throw error and error is not handled', done => {
        const machineConfig = getMachineConfig();
        machineConfig.states.S1.tasks = [ taskError, task ];
        machineConfig.states.S2.tasks = [];
        const stateMachine = StateMachine(machineConfig);
        expect(stateMachine.start()).to.eventually.be.equal(1).and.notify(done);
    });

    it('should terminate with exitCode 1 if errorHandler returns an invalid state', done => {
        const machineConfig = getMachineConfig();
        machineConfig.states.S1.tasks = [ taskError, task ];
        machineConfig.states.S2.tasks = [];
        machineConfig.errorHandler = () => 'S10';
        const stateMachine = StateMachine(machineConfig);
        expect(stateMachine.start()).to.eventually.be.equal(1).and.notify(done);
    });
});
