const { DataTypes } = require('sequelize');
const sequelizeInstance = require('./database');

const Users = sequelizeInstance.define('User', {
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

