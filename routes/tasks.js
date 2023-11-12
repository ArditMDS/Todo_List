var express = require('express');
var router = express.Router();
let sqlQuery = require('../mysql/sql')
const jwt = require("jsonwebtoken");

//Get pour voir toutes les taches sans exceptions
//router.get('/', function(req, res, next) {
//    sqlQuery("SELECT id, title, due_date, done  FROM todo", (queryError, results) => {
//        if(results.length > 0){
//            res.json(results)
//        } else {
//            res.send("Il n'y a pas de tâches");
//        }
//    })
//});
function decodeTokenAndGetUserId(req) {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    try {
        // Decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Extract and return the user ID
        const userId = decoded.id;
        return userId;
    } catch (error) {
        // Handle decoding errors (e.g., invalid token)
        console.error('Error decoding token:', error);
        return null;
    }
}

//Get pour les taches du user connecté
router.get('/', function (req, res, next) {
    const tasksPerPage = 2;
    const currentPage = req.query.page || 1;
    const searchQuery = req.query.search;
    const currentUserId = decodeTokenAndGetUserId(req);
    const isDone = req.query.done;
    const offsetValue = (currentPage - 1) * tasksPerPage;
    let conditions = [];
    if (isDone === "1") {
        conditions.push("done = 1");
    }
    else if (isDone === "0") {
        conditions.push("done = 0");
    }
    if (searchQuery) {
        conditions.push(`title LIKE '%${searchQuery}%'`);
    }
    const whereClause = conditions.length > 0 ? conditions.join(' AND ') : "1=1";
    const sqlRequest = `SELECT title, done, due_date FROM todo WHERE ${whereClause} AND user_id= ${currentUserId} LIMIT ${tasksPerPage} OFFSET ${offsetValue}`;
    sqlQuery(sqlRequest, (result) => {
        const countQuerySql = `SELECT COUNT(*) as count FROM todo WHERE ${whereClause}`;
        sqlQuery(countQuerySql, (countResult) => {
            const totalCount = countResult[0].count;
            const hasPreviousPage = currentPage > 1;
            const hasNextPage = (currentPage - 1) * tasksPerPage + result.length < totalCount;
            res.json({
                tasks: result,
                currentUserId,
                pagination: {
                    totalCount,
                    currentPage,
                    tasksPerPage,
                    offsetValue,
                    hasPreviousPage,
                    hasNextPage,
                },
            });
        });
    });
});



//Get par Id
router.get('/:id', function(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    let id = parseInt(req.params.id);
    sqlQuery(`SELECT * FROM todo WHERE id = ${id} AND user_id = ${decodeTokenAndGetUserId(req)}`, (results) => {
        if(results.length > 0) {
            res.json(results);
        } else {
            res.send("404 - Cette page n'éxiste pas");
        }
    })
});

//Ajouter une nouvelle tache
router.post('/', (req, res) => {
    const { title, due_date, done, description } = req.body;
    const postQuery = `INSERT INTO todo (title, due_date, done, description, user_id) VALUES ("${title}", "${due_date}", "${done}", "${description}", "${decodeTokenAndGetUserId(req)}")`;
    try {
        sqlQuery(postQuery, (result) => {
            if (result.affectedRows === 1) {
                res.json({ message: 'La tâche à été ajouté !' });
            } else {
                res.status(500).json({
                    error: "L'ajout n'a pas pu se faire à cause d'une erreur"
                });
            }
        });
    } catch (exception) {
        res.status(500)
        res.send("Error : " + exception)
    }
});


//Update une tache
router.patch('/:id', function (req, res) {
    const id = parseInt(req.params.id);
    const userId = decodeTokenAndGetUserId(req);
    console.log(userId)
    const updatedTask = req.body;
    console.log(updatedTask)
    const updateFields = Object.keys(updatedTask).map(key => `${key} = '${updatedTask[key]}'`);
    const sql = `UPDATE todo SET ${updateFields.join(', ')} WHERE id = ${id}`;
    sqlQuery(`SELECT * FROM todo WHERE id = ${id}`, (data) => {
        if(parseInt(data[0].user_id) === parseInt(userId)) {
            sqlQuery(sql, (result) => {
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Tâche non trouvée' });
                }
                res.json(updatedTask);
            });
        } else {
            res.send("Vous n'avez pas accés à cette tâche")
        }
    })

});

//Supprimer une tache
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    sqlQuery(`DELETE FROM todo WHERE id = ${id}`, (result) => {
        if (result.affectedRows === 1) {
            res.json({ message: 'La tâche à été supprimé' });
        } else {
            res.status(500).json({ message: 'Erreur lors de la suppression de la tâche' });
        }
    });
});


module.exports = router;
