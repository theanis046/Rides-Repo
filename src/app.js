'use strict';

const express = require('express');
const app = express();
const {getRideById, insertRides, getRides} = require('./services/ridesService');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const logger = require('./utilities/logger')

module.exports = () => {
	app.get('/health', (req, res) => res.send('Healthy'));
	app.post('/rides', jsonParser, insertRides)
	app.get('/rides', getRides)
	app.get('/rides/:id', getRideById);
    
	return app;
};
