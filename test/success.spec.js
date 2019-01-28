const chai = require("chai");
const sinon = require("sinon");

chai.use(require("sinon-chai"));
chai.use(require("chai-as-promised"));

const expect = chai.expect;

const { StateMachine } = require('../lib/index');

const machineConfig = {
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
    errorHandler: ({ currentState, taskName, taskResult, error }) => {},
    cleanupTasks: undefined,
};

const task1 = { name: 'task1', task: () => {} };
const task2 = { name: 'task2', task: () => {} };
const cleanupTask1 = { name: 'cleanup1', task: () => {} };
const cleanupTask2 = { name: 'cleanup2', task: () => {} };

describe('StateMachine success', () => {
    it('should terminate with exitCode 0 if no tasks or cleanupTasks are provided', done => {
        machineConfig.states.S1.tasks = [],
        machineConfig.states.S2.tasks = [];
        const stateMachine = StateMachine(machineConfig);
        expect(stateMachine.start()).to.eventually.be.equal(0).notify(done);
    });

    it('should terminate with exitCode 0 if only tasks are provided', done => {
        machineConfig.states.S1.tasks = [ task1 ],
        machineConfig.states.S2.tasks = [ task2 ];
        const stateMachine = StateMachine(machineConfig);
        expect(stateMachine.start()).to.eventually.be.equal(0).and.notify(done);
    });

    it('should terminate with exitCode 0 if only cleanupTasks are provided', done => {
        machineConfig.states.S1.tasks = [];
        machineConfig.states.S2.tasks = [];
        machineConfig.cleanupTasks = [ cleanupTask1, cleanupTask2 ];
        const stateMachine = StateMachine(machineConfig);
        expect(stateMachine.start()).to.eventually.be.equal(0).notify(done);
    });

    it('should terminate with exitCode 0 if both tasks and cleanup tasks are provided', done => {
        machineConfig.states.S1.tasks = [];
        machineConfig.states.S2.tasks = [ task1, task2 ];
        machineConfig.cleanupTasks = [ cleanupTask1, cleanupTask2 ];
        const stateMachine = StateMachine(machineConfig);
        expect(stateMachine.start()).to.eventually.be.equal(0).notify(done);
    });
});
