'use strict';

const SQLStatements = {

	getAllRides: () => 'SELECT * FROM Rides',
	getRideById: (rideId) => `SELECT * FROM Rides WHERE rideID=${rideId}`,
	getPaginatedRides :(pageSize, offset) => `SELECT * FROM Rides LIMIT ${pageSize} OFFSET ${offset}`,
	createRide: () => 'INSERT INTO Rides(startLat, startLong,' +
        'endLat, endLong, riderName, driverName, driverVehicle, rideID) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
	getLasInsertedRide: () => 'SELECT last_insert_rowid() AS id',
};

module.exports = {
	SQLStatements
};