const { expect } = require('chai');
const baseDb = require('../src/services/baseRepo');
const sinon = require('sinon');

describe('DB tests', () => {
	let dbRunAsyncMock;
	let dbAllAsyncMock;

	before(() => {
		dbRunAsyncMock = sinon.stub(baseDb.db, 'run');
		dbAllAsyncMock = sinon.stub(baseDb.db, 'all');
	});

	after(() => {
		dbRunAsyncMock.restore();
		dbAllAsyncMock.restore();

		if (baseDb.db.run.restore) {
			baseDb.db.run.restore();
		}

		if (baseDb.db.all.restore) {
			baseDb.db.all.restore();
		}
	});

	it('dbRunAsync should be a function', () => {
		expect(typeof baseDb.dbRunAsync).to.equal('function');
	});

	it('dbRunAsync must call the run function of baseDb', async () => {
		dbRunAsyncMock.yieldsRight();
		await baseDb.dbRunAsync('', []);
		expect(dbRunAsyncMock.called).to.equal(true);
	});

	it('dbAllAsync should be a function', () => {
		expect(typeof baseDb.dbAllAsync).to.equal('function');
	});

	it('dbAllAsync must call all function of baseDb', async () => {
		dbAllAsyncMock.yieldsRight();
		await baseDb.dbAllAsync('', []);
		expect(dbAllAsyncMock.called).to.equal(true);
	});

	it('if DB error occurs, runAsync must throw an error', async () => {
		dbRunAsyncMock.yieldsRight(new Error());
		let isThrowError;

		try {
			await baseDb.dbRunAsync('', []);
			isThrowError = false;
		} catch (e) {
			isThrowError = true;
		}

		expect(isThrowError).to.equal(true);
	});

	it('if DB error occurs, dbAllAsync must throw an error', async () => {
		dbAllAsyncMock.yieldsRight(new Error());
		let isThrowError;

		try {
			await baseDb.dbAllAsync('', []);
			isThrowError = false;
		} catch (e) {
			isThrowError = true;
		}

		expect(isThrowError).to.equal(true);
	});
});