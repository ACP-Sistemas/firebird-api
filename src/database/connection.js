'use strict';

const { connection, textEncoding, transactionOptions } = require('../config.json');

const Firebird = require('node-firebird');
const iconv = require('iconv-lite');

const { database, host, port, pageSize = 4096, encoding = 'UTF8', blobAsText = false } = connection;
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
                },
                    transactionOptions
                );
            } catch (error) {
                reject(error);
            }
        });
    }
}

async function doConnection() {
    return new Promise((resolve, reject) => {
        try {
            const user = process.env.FIREBIRDAPI_USER;
            const password = process.env.FIREBIRDAPI_PASSWORD;

            if (!user || !password) {
                throw new Error('user and password required');
            }

            Firebird.attach({
                user,
                password,
                database,
                host,
                port,
                role,
                pageSize,
                encoding,
                blobAsText
            }, function (error, db) {
                if (error) {
                    reject(error);
                } else {
                    resolve(db);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};

async function readResults(results) {
    if (results) {
        for (let i = 0; i < results.length; i++) {
            const record = results[i];
            const campos = Object.keys(record);

            for (let j = 0; j < campos.length; j++) {
                const campo = campos[j];

                // Read BLOBs
                if (typeof record[campo] == 'function') {
                    const subType = record[campo].subType;
                    const bufferBlob = await readBlob(record[campo]);
                    if (subType)
                        record[campo] = iconv.decode(bufferBlob, textEncoding) || null;
                    else
                        record[campo] = bufferBlob || null;
                    continue;
                }

                // Convert buffer or string fields
                if (record[campo] && (typeof record[campo] === 'string' || record[campo].buffer)) {
                    const bufferTexto = Buffer.from(record[campo], 'binary');
                    record[campo] = iconv.decode(bufferTexto, textEncoding);
                }
            }
        }
    }

    return results;
};

async function readBlob(streaming) {
    return new Promise((resolve) => {
        streaming(function (err, name, event) {
            if (err) return resolve(null);

            let chunks = [];

            event.on('data', function (chunk) {
                chunks.push(chunk);
            });

            event.on('end', function () {
                resolve(Buffer.concat(chunks));
            });
        });
    });
};