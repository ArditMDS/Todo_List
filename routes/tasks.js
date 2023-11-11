var express = require('express');
var router = express.Router();
let sqlQuery = require('../mysql/sql')

/* GET tasks listing. */
router.get('/', function(req, res, next) {
    sqlQuery("SELECT * FROM tasks", (queryError, results) => {
        if(queryError){
            res.json(queryError)
        } else {
            res.json(results)
        }
    })
});

module.exports = router;
