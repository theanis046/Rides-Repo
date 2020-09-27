const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

module.exports = {
	dbAllAsync: (sqlStatement, params) => (
		new Promise((resolve, reject) => {
			db.all(sqlStatement, params, (err, rows) => {
				if (err) {
					reject(err);
				}
				resolve(rows);
			});
		})
	),
	dbRunAsync: (sqlStatement, params) => (
		new Promise((resolve, reject) => {
			db.run(sqlStatement, params, (err, rows) => {
				if (err) {
					reject(err);
				}
				resolve(rows);
			});
		})
	),
	db,
};