'use strict'; 

const { connection, enableBlobSubtypeText = false } = require('../config.json');

const Firebird = require('node-firebird');

const { database, host, port, pageSize = 4096 } = connection;
const role = null;

module.exports = {
    async query(sql) {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await doConnection();
    
                db.query(sql, async (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        const readableResults = await readResults(results);
                        
                        resolve(readableResults);
                        db.detach();
                    }
                });
            } catch(error) {
                reject(error);
            }
        });
    }
}

async function doConnection() {
    return new Promise((resolve, reject) => {
        try {
            const user     = process.env.FIREBIRDAPI_USER;
            const password = process.env.FIREBIRDAPI_PASSWORD;

            if(!user || !password) {
                throw new Error('user and password required');
            }

            Firebird.attach({
                user,
                password,
                database,
                host,
                port,
                role,
                pageSize
            }, function (error, db) {
                if (error) {
                    reject(error);
                } else {
                    resolve(db);
                }
            });
        } catch(error) {
            reject(error);
        }
    });
};

async function readResults(results){
    if(results) {
        for(let i = 0; i < results.length; i++) {
            const record = results[i];
            const campos = Object.keys(record);

            for(let j = 0; j < campos.length; j++) {
                const campo = campos[j];

                if(typeof record[campo] == 'function') {//BLOB
                    const string = await readBlob(record[campo]);
                    record[campo] = string || null;
                }

                if(record[campo] && record[campo].buffer) {
                    record[campo] = record[campo].toString('win1252');
                }
            }
        }
    }

    return results;
};

async function readBlob(streaming) {
    return new Promise((resolve, reject) => {
        streaming(function(err, name, event) {
            if (err) { 
                resolve(null); 
                return;
            }

            let string = '';

            event.on('data', function(chunk) {
                string += chunk.toString();
            });

            event.on('end', function() {
                resolve(string);
            });
        });
    });
};