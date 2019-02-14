const chai = require("chai");
const sinon = require("sinon");

chai.use(require("sinon-chai"));
chai.use(require("chai-as-promised"));

const expect = chai.expect;

const {
    StateMachine
} = require('../lib/index');

const error = Error('ooops!');

let count = 0;

let task1 = () => {};
let task2 = () => {
    if (count === 2) {
        throw error;
    }
    count = count + 1;
    return {};
};
let task3 = () => {};
let cleanupTask1 = () => {};
let cleanupTask2 = () => {};
let errorHandler = () => {
    return 'S3';
};
let machineConfig;

describe('StateMachine callCount', () => {
    before(() => {
        task1 = sinon.spy(task1);
        task2 = sinon.spy(task2);
        task3 = sinon.spy(task3);
        cleanupTask1 = sinon.spy(cleanupTask1);
        cleanupTask2 = sinon.spy(cleanupTask2);
        errorHandler = sinon.spy(errorHandler);

        machineConfig = {
            errorHandler,
            initialState: 'S1',
            terminateState: 'TERMINATE',
            states: {
                S1: {
                    tasks: [{
                        name: 'task1',
                        task: task1
                    }, {
                        name: 'task1',
                        task: task1
                    }],
                    nextState: 'S2',
                },
                S2: {
                    tasks: [{
                        name: 'task1',
                        task: task1
                    }, {
                        name: 'task2',
                        task: task2
                    }],
                    nextState: 'S2',
                },
                S3: {
                    tasks: [{
                        name: 'task1',
                        task: task1
                    }, {
                        name: 'task3',
                        task: task3
                    }],
                    nextState: 'TERMINATE',
                }
            },
            cleanupTasks: [{
                name: 'cleanupTask1',
                task: cleanupTask1
            }, {
                name: 'cleanupTask2',
                task: cleanupTask2
            }],
        };
    });

    it('should terminate with exitCode 0', done => {
        const stateMachine = StateMachine(machineConfig);
        expect(stateMachine.start()).to.eventually.be.equal(0).and.notify(done);
    });

    it('should call 6 times task1', () => {
        expect(task1.callCount).to.equal(6);
    });

    it('should call 3 times task2', () => {
        expect(task2.callCount).to.equal(3);
    });

    it('should call 1 times task3', () => {
        expect(task3.callCount).to.equal(1);
    });

    it('should call the errorHandler 1 time', () => {
        expect(errorHandler.callCount).to.equal(1);
    });

    it('should call the errorHandler with params', () => {
        const errorParams = {
            error,
            currentState: 'S2',
            taskName: 'task2',
        };

        expect(errorHandler.calledWith(errorParams)).to.equal(true);
    });
});