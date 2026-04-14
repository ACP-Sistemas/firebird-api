'use strict';

const connection = require('../database/connection');

module.exports = {
    async query(request, response) {
        try {
            const { sql } = request.body;

            const results = await connection.query(sql);

            response.header('X-Total-Count', results ? results.length : 0);

            return response.json(results);

        } catch (error) {
            return response.json({ error: error.toString() });
        }
    }
}