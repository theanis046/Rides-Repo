const { dbAllAsync,dbRunAsync } = require('./baseRepo');
const { SQLStatements } = require('../constants')
const logger = require('../utilities/logger')

module.exports = {
	getRideById: async (req, res) => {
		try {
			const query = SQLStatements.getRideById(req.params.id);
			const rows = await dbAllAsync(query);
            
			if (rows.length == 0 ) {
				return res.status(400).send({
					error_code: 'RIDES_NOT_FOUND_ERROR',
					message: 'Could not find any rides'
				});
			}
            
			return res.send(rows.length === 0 ? value : rows);
		} catch (e) {
			return res.status(400).send({
				error_code: 'SERVER_ERROR',
				message: 'Unknown error'
			});
		}
	},
    

	insertRides: async (req, res) => {
		const startLatitude = Number(req.body.start_lat);
		const startLongitude = Number(req.body.start_long);
		const endLatitude = Number(req.body.end_lat);
		const endLongitude = Number(req.body.end_long);
		const riderName = req.body.rider_name;
		const driverName = req.body.driver_name;
		const driverVehicle = req.body.driver_vehicle;
    
		if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
			logger.info('Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively');
			return res.status(400).send({
				error_code: 'VALIDATION_ERROR',
				message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
			});
		}

		if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
			return res.status(400).send({
				error_code: 'VALIDATION_ERROR',
				message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
			});
		}

		if (typeof riderName !== 'string' || riderName.length < 1) {
			return res.status(400).send({
				error_code: 'VALIDATION_ERROR',
				message: 'Rider name must be a non empty string',
			});
		}
    
		if (typeof driverName !== 'string' || driverName.length < 1) {
			return res.status(400).send({
				error_code: 'VALIDATION_ERROR',
				message: 'Driver name must be a non empty string',
			});
		}
    
		if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
			return res.status(400).send({
				error_code: 'VALIDATION_ERROR',
				message: 'Vehicle type must be a non empty string',
			});
		}
    
		const values = [
			req.body.start_lat,
			req.body.start_long,
			req.body.end_lat,
			req.body.end_long,
			req.body.rider_name,
			req.body.driver_name,
			req.body.driver_vehicle,
		];        
    
		try {
			let result = await dbRunAsync(SQLStatements.createRide(), values);

			const data = await dbAllAsync(SQLStatements.getLasInsertedRide());
			const rows = await dbAllAsync(SQLStatements.getRideById(data.pop().id));
			return res.send(rows);
		} catch (e) {
			return res.status(400).send({
				error_code: 'SERVER_ERROR',
				message: 'Unknown error'
			});
		}
	},
    
	getRides : async (req, res) => {
		try {
			// Pagination
			let pageNumber, pageSize;
			let sqlStatement;
			if (req.query) {
				pageNumber = req.query.pageNumber;
				pageSize = req.query.pageSize;
			}

			if (pageNumber && pageSize) {
				pageNumber = parseInt(pageNumber)
				pageSize = parseInt(pageSize)
            
				if (Number.isNaN(pageNumber)|| Number.isNaN(pageSize)) {
					return res.status(400).send({
						error_code: 'VALIDATION_ERROR',
						message: 'Page Number and Page Size should be valid numbers'
					})
				}

				let offset = pageSize * (pageNumber - 1)
				sqlStatement =  SQLStatements.getPaginatedRides(pageSize,offset)
			}
			else {
				sqlStatement = SQLStatements.getAllRides();
			}

			const rows = await dbAllAsync(sqlStatement);
			
			if (rows.length === 0) {
				return res.status(400).send({
					error_code: 'RIDES_NOT_FOUND_ERROR',
					message: 'Could not find any rides'
				});
			}
			return res.send(rows);
		} catch (error) {
			return res.status(400).send({
				error_code: 'SERVER_ERROR',
				message: 'Unknown error'
			}); 
		}
	}
};