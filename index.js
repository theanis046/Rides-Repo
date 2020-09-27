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

db.serialize(() => {
	buildSchemas(db);

	const app = require('./src/app')();
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
	app.listen(port, () => console.log(`App started and listening on port ${port}`));
});