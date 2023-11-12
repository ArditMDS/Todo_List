const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

const Tasks = sequelize.define('Task', {
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
    user: {
        type: DataTypes.STRING(25),
    },
    description: {
        type: DataTypes.TEXT,
    },
}, {});

module.exports = Tasks ;

