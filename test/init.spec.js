const chai = require("chai");
const sinon = require("sinon");

chai.use(require("sinon-chai"));
chai.use(require("chai-as-promised"));

const expect = chai.expect;

const { StateMachine } = require('../lib/index');

describe('StateMachine initialization', () => {
    it('should throw error if "initialSate" is missing', () => {
        expect(() => StateMachine({})).to.throw(Error, 'initialState missing');
    });

    it('should throw error if "terminateState" is missing', () => {
        const testConfig = {
            initialState: 'S1',
        };
        expect(() => StateMachine(testConfig)).to.throw(Error, 'terminateState missing');
    });

    it('should throw error if "states" is missing', () => {
        const testConfig = {
            initialState: 'S1',
            terminateState: 'ST',
        };
        expect(() => StateMachine(testConfig)).to.throw(Error, 'Missing states property');
    });

    it('should throw error if states are not defined', () => {
        const testConfig = {
            initialState: 'S1',
            terminateState: 'ST',
            states: {},
        };
        expect(() => StateMachine(testConfig)).to.throw(Error, 'State definition is missing');
    });

    it('should throw error if a state is defined with the same name as \'terminateState\'', () => {
        const testConfig = {
            initialState: 'S1',
            terminateState: 'FOO',
            states: { FOO: {} },
        };
        expect(() => StateMachine(testConfig)).to.throw(Error, 'State \'FOO\' is reserved for machine termination');
    });
    
    it('should throw error if "tasks" is missing for state S1', () => {
        const testConfig = {
            initialState: 'S1',
            terminateState: 'ST',
            states: { S1: {} },
        };
        expect(() => StateMachine(testConfig)).to.throw(Error, 'Missing \'tasks\' property for state: S1');
    });

    it('should throw error if "task" is invalid for state S1', () => {
        const testConfig = {
            initialState: 'S1',
            terminateState: 'ST',
            states: { 
                S1: {
                    tasks: [ {} ], 
                },
            },
        };
        expect(() => StateMachine(testConfig)).to.throw(Error, 'Invalid task in state: S1. Tasks must me of the form: \'{ name: \'foo\', task: foo }\'');
    });

    it('should throw error if "nextState" is missing for state S1', () => {
        const testConfig = {
            initialState: 'S1',
            terminateState: 'ST',
            states: { 
                S1: {
                    tasks: [ { name: 'name', task: () => {} } ],
                },
            },
        };
        expect(() => StateMachine(testConfig)).to.throw(Error, 'Missing \'nextState\' property for state: S1');
    });

    it('should throw error if nextState is an invalid state', () => {
        const testConfig = {
            initialState: 'S1',
            terminateState: 'ST',
            states: { 
                S1: {
                    tasks: [ { name: 'name', task: () => {} } ],
                    nextState: 'S2',
                },
            },
        };
        expect(() => StateMachine(testConfig)).to.throw(Error, '\'nextState\' is invalid for state: S1');
    });

    it('should throw error if "errorHandler" is missing', () => {
        const testConfig = {
            initialState: 'S1',
            terminateState: 'ST',
            states: { 
                S1: {
                    tasks: [ { name: 'name', task: () => {} } ],
                    nextState: 'ST',
                },
            },
        };
        expect(() => StateMachine(testConfig)).to.throw(Error, 'Missing errorHandler property');
    });

    it('should throw error if optional "cleanupTasks" is not an array', () => {
        const testConfig = {
            initialState: 'S1',
            terminateState: 'ST',
            states: { 
                S1: {
                    tasks: [ { name: 'name', task: () => {} } ],
                    nextState: 'ST',
                },
            },
            errorHandler: () => {},
            cleanupTasks: "not array",
        };
        expect(() => StateMachine(testConfig)).to.throw(Error, 'Invalid cleanupTasks property. Must be an array of functions');
    });
});
