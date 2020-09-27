'use strict';

const express = require('express');
const app = express();
const port = 8010;

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const swaggerUi = require('swagger-ui-express'),
	swaggerDocument = require('./swagger.json')

const {db} =  require('./src/services/baseRepo')
const buildSchemas = require('./src/schemas');
const cluster = require('cluster');
const logger = require('./src/utilities/logger')


if (cluster.isMaster) {
	const cpuCount = require('os').cpus().length;
	for (let i = 0; i < cpuCount; i += 1) {
		cluster.fork();
	}
} else {
	db.serialize(() => {
		buildSchemas(db);
    
		const app = require('./src/app')();
		app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
		app.listen(port, () => logger.info(`App started and listening on port ${port}`));
	});
}
