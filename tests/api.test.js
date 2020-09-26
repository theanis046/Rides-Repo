'use strict';

const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const sinon = require('sinon');
const { expect } = require('chai');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
	before((done) => {
		db.serialize((err) => { 
			if (err) {
				return done(err);
			}

			buildSchemas(db);

			done();
		});
	});
    
	afterEach(() => {
		if (db.all.restore) {
			db.all.restore();
		}
	});
    
	describe('GET /health', () => {
		it('should return health', (done) => {
			request(app)
				.get('/health')
				.expect('Content-Type', /text/)
				.expect(200, done);
		});
	});
    
	describe('GET /rides', () => {
		it('Incase of no rides, API should return 400', (done) => {
			request(app)
				.get('/rides')
				.expect(400, done);
		});
	});
    
	it('Error object should be returned in case of unhandled Error', (done) => {
		sinon.stub(db, 'all').yieldsRight(new Error('Unhandled Error'));
    
		request(app)
			.get('/rides')
			.then((response) => {
				expect(response.body).to.have.property('error_code');
				expect(response.body).to.have.property('message');
				expect(response.body.error_code).to.equal('SERVER_ERROR');
				expect(response.body.message).to.equal('Unknown error');
				done();
			});
	});
    
	it('empty rides should return RIDES_NOT_FOUND_ERROR', (done) => {
		sinon.stub(db, 'all').yieldsRight(null, []);
    
		request(app)
			.get('/rides')
			
			.expect(400)
			.then((response) => {
				expect(Object.keys(response.body).length).to.be.equal(2);
				expect(response.body).to.have.property('error_code');
				expect(response.body).to.have.property('message');
				expect(response.body.error_code).to.equal('RIDES_NOT_FOUND_ERROR');
				expect(response.body.message).to.equal('Could not find any rides');
				done();
			});
	});
    
	it('Ride should return valid result for valid ride', (done) => {
		const mockData = [];
    
		for (let i = 0; i < 2; i += 1) {
			mockData.push({
				rideId: i,
				startLat: i,
				startong: i,
				endLat: i,
				startLong: i,
				riderName: 'rider'+i,
				driverName: 'driver'+i,
				driverVehicle: 'vehicle'+i,
				created: Date(),
			});
		}
    
		sinon.stub(db, 'all').yieldsRight(null, mockData);
    
		request(app)
			.get('/rides')
			.expect('Content-Type', /json/)
			.expect(200)
			.then((response) => {
				expect(response.body.length).to.be.equal(mockData.length);
    
				for (let i = 0; i < response.body.length; i += 1) {
					const {
						rideId, startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle,
					} = response.body[i];
    
					expect(rideId).to.equal(mockData[i].rideId);
					expect(startLat).to.equal(mockData[i].startLat);
					expect(startLong).to.equal(mockData[i].startLong);
					expect(endLat).to.equal(mockData[i].endLat);
					expect(endLong).to.equal(mockData[i].endLong);
					expect(riderName).to.equal(mockData[i].riderName);
					expect(driverName).to.equal(mockData[i].driverName);
					expect(driverVehicle).to.equal(mockData[i].driverVehicle);
				}
    
				done();
			});
	});
    
	describe('GET /rides/:id', () => {
		it('Invalid rideId should return error object', (done) => {
			let rideId = 999
			request(app)
				.get(`/rides/${rideId}`)
				.expect(400, done);
		});
    
		it('If unhanlded Error occurs then system should return SERVER_ERROR', (done) => {
			sinon.stub(db, 'all').yieldsRight(new Error('Unhandled Error'));
			let rideId = 999;
			request(app)
				.get(`/rides/${rideId}`)
				.expect(400)
				.then((response) => {
					expect(Object.keys(response.body).length).to.be.equal(2);
					expect(response.body.error_code).to.equal('SERVER_ERROR');
					expect(response.body.message).to.equal('Unknown error');
					done();
				});
		});
    
		
	});
    
	describe('POST /rides', () => {
		it('Endpoint should be available', (done) => {
			request(app)
				.post('/rides')
				.expect(400, done);
		});
      
		it('Invalid start latitude should return VALIDATION_ERROR', (done) => {
			let latitude = 100;
			request(app)
				.post('/rides')
				.send({ start_lat: latitude })
				.expect(400)
				.then((response) => {
					expect(response.body.error_code).to.equal('VALIDATION_ERROR');
					expect(response.body.message).to.equal('Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively');
					done();
				});
		});
        
		it('Invalid start longitude should return VALIDATION_ERROR', (done) => {
			let startLongitude = 200;
			request(app)
				.post('/rides')
				.send({ start_long: startLongitude })
				.expect(400)
				.then((response) => {
					expect(response.body.error_code).to.equal('VALIDATION_ERROR');
					expect(response.body.message).to.equal('Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively');
					done();
				});
		});
        
		it('Invalid end latitude should return VALIDATION_ERROR', (done) => {
			let endlatitude = 100;
			request(app)
				.post('/rides')
				.send({ end_lat: endlatitude })
				.expect(400)
				.then((response) => {
					expect(response.body.error_code).to.equal('VALIDATION_ERROR');
					expect(response.body.message).to.equal('End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively');
					done();
				});
		});
        
		it('Invalid end longitude should return VALIDATION_ERROR', (done) => {
			let endLongitude = 200;
			request(app)
				.post('/rides')
				.send({ end_long: endLongitude })
				.expect(400)
				.then((response) => {
					expect(response.body.error_code).to.equal('VALIDATION_ERROR');
					expect(response.body.message).to.equal('End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively');
					done();
				});
		});
        
		it('Empty rider name should return VALIDATION_ERROR', (done) => {
			let rideObjct = {
				start_lat: 10,
				start_long: 10,
				end_lat: 10,
				end_long: 10,
				rider_name: ''
			}
			request(app)
				.post('/rides')
				.send(rideObjct)
				.expect(400)
				.then((response) => {
					expect(response.body.error_code).to.equal('VALIDATION_ERROR');
					expect(response.body.message).to.equal('Rider name must be a non empty string');
					done();
				});
		});
        
		it('Empty driver name should return VALIDATION_ERROR', (done) => {
			let rideObjct = {
				start_lat: 10,
				start_long: 10,
				end_lat: 10,
				end_long: 10,
				rider_name: 'rider',
				driver_name: ''
			}
			request(app)
				.post('/rides')
				.send(rideObjct)
				.expect(400)
				.then((response) => {
					expect(response.body.error_code).to.equal('VALIDATION_ERROR');
					expect(response.body.message).to.equal('Rider name must be a non empty string');
					done();
				});
		});
        
		it('Empty driverVehicle name should return VALIDATION_ERROR', (done) => {
			let rideObjct = {
				start_lat: 10,
				start_long: 10,
				end_lat: 10,
				end_long: 10,
				rider_name: 'rider',
				driver_name: 'driver',
				driver_vehicle: ''
			}
			request(app)
				.post('/rides')
				.send(rideObjct)
				.expect(400)
				.then((response) => {
					expect(response.body.error_code).to.equal('VALIDATION_ERROR');
					expect(response.body.message).to.equal('Rider name must be a non empty string');
					done();
				});
		});
        
		it('Valid Ride Object should return success response', (done) => {
			let rideObjct = {
				start_lat: 10,
				start_long: 10,
				end_lat: 10,
				end_long: 10,
				rider_name: 'rider',
				driver_name: 'driver',
				driver_vehicle: 'vehicle'
			}
			request(app)
				.post('/rides')
				.send(rideObjct)
				.expect(200)
				.then((response) => {
					expect(response.body).to.not.have.property('error_code');
					expect(response.body).to.not.have.property('message');
					done();
				});
		});
	})
});