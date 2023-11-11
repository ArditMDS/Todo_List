const mysql = require('mysql2')

//Création de la pool

const pool = mysql.createPool({
    'host': process.env.DB_HOST,
    'user': process.env.DB_USER,
    'password': process.env.DB_PASSWORD,
    'database': process.env.DB_NAME,
    multipleStatements: true
});

function sqlQuery(query, callback){
    pool.getConnection((connError, connection) => {
        if(connError){
            console.log(connError);
            throw new Error("Connection error " + connError);
        }
        try {
            connection.query(query, (error, result) => {
                if(error){
                    console.log(error);
                    throw new Error("Query error " + error);
                }

                callback(result);
            });
        } catch(error){
            throw new Error("Unexpected error occured : " + error);
        }
        connection.release();
    });
}

module.exports = sqlQuery;