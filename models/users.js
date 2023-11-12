const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

const Users = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    display_name: {
        type: DataTypes.STRING,
    },
}, {
    indexes: [
        {unique: true, fields: ['email']},
    ]
});

module.exports = Users ;

