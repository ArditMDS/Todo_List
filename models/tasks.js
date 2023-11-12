const { DataTypes } = require('sequelize');
const sequelizeInstance = require('./database');

const Task = sequelizeInstance.define('Task', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    done: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
}, {});

module.exports = Task ;

