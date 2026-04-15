'use strict';

const connection = require('../database/connection');

function validateSelectOnly(sql) {
    const trimmedSql = sql.trim().toUpperCase();
    if (!trimmedSql.startsWith('SELECT ')) {
        throw new Error('Only SELECT queries are allowed');
    }
    if (trimmedSql.includes(';')) {
        throw new Error('Multiple statements are not allowed');
    }
}

module.exports = {
    async query(request, response) {
        try {
            const { sql } = request.body;

            const readonly = process.env.FIREBIRDAPI_READONLY;

            if (readonly === 'true') {
                validateSelectOnly(sql);
            }

            const results = await connection.query(sql);

            response.header('X-Total-Count', results ? results.length : 0);

            return response.json(results);

        } catch (error) {
            return response.json({ error: error.toString() });
        }
    }
}