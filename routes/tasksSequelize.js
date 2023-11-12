var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const Task = require('../models/tasks');

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

router.get('/', async function (req, res) {
    try {
        const tasks = await Task.findAll({
            where: {
                user_id: decodeTokenAndGetUserId(req),
            }
        });
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:id', function (req, res, next) {
    const id = parseInt(req.params.id);
    Task.findByPk(id).then((task) => {
        if (task === null) {
            res.status(404);
            res.send("Cette tâche n'éxiste pas");
            return;
        }
        res.json(task);
    });
});
router.post('/', async function (req, res) {
    try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.send("Il y a eu un problême lors de l'ajout");
    }
});

router.delete('/:id', function (req, res, next) {
    const id = parseInt(req.params.id);
    Task.findByPk(id).then((task) => {
        if (!task) {
            res.status(404).send("Cette tâche n'éxiste pas");
            return;
        }
        task.destroy().then(() => {
            res.send("Cette tâche à été supprimé");
        });
    });
});

module.exports = router;
