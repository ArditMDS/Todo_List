var express = require('express');
var router = express.Router();
let sqlQuery = require('../mysql/sql')

/* GET tasks listing. */
router.get('/', function(req, res, next) {
    sqlQuery("SELECT id, title, due_date, done  FROM todo", (queryError, results) => {
        if(results.length > 0){
            res.json(results)
        } else {
            res.send("Il n'y a pas de tâches");
        }
    })
});
//Get par Id
router.get('/:id', function(req, res, next) {
    let id = parseInt(req.params.id);
    sqlQuery(`SELECT * FROM todo WHERE id = ${id}`, (results) => {
        if(results.length > 0) {
            res.json(results);
        } else {
            res.send("404 - Cette page n'éxiste pas");
        }
    })
});

//Ajouter une nouvelle tache
router.post('/', (req, res) => {
    const { title, due_date, done, description, user_id } = req.body;
    const postQuery = `INSERT INTO todo (title, due_date, done, description, user_id) VALUES ("${title}", "${due_date}", "${done}", "${description}", "${user_id}")`;
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

module.exports = router;
