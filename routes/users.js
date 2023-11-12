var express = require('express');
var router = express.Router();
const mysql = require("mysql2");
const sqlQuery = require("../mysql/sql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function generateToken(id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {expiresIn: '1d'});
}

//  Nouvelle utilisateur
router.post('/signup', (req, res) => {
  const body = req.body;
  if (!body.email || !body.password || !body.display_name) {
    res.status(400)
    res.send("Tous les champs sont obligatoires")
    return
  }

  if (body.password.length < 8) {
    res.status(400)
    res.send("MDP doit avoir au moins 8 symboles")
    return
  }

  bcrypt.hash(body.password, 12).then(hashedPassword => {
    const insertQuery = `INSERT INTO user (email, password, display_name) VALUES ("${body.email}", "${hashedPassword}", "${body.display_name}")`;
    try {
      sqlQuery(insertQuery, (result) => {
        res.status(201)
        res.send("Utilisateur créé: " + body.email)
      });
    } catch (exception) {
      res.status(500)
      res.send("Erreur lors de la création : " + exception)
    }
  })
})

router.post('/login', (req, res) => {
  const body = req.body;

  if (!body.email || !body.password) {
    res.status(400)
    res.send("Tous les champs sont obligatoires")
    return
  }

  sqlQuery(`SELECT * FROM user WHERE email="${body.email}"`, (results) => {
    if (results.length === 0) {
      res.status(400);
      res.send("Invalid password or email");
    }

    const user = results[0];
    bcrypt.compare(body.password, user.password).then(isOk => {
      if (!isOk) {
        res.status(400);
        res.status("Invalid password or email");
      } else {
        delete user.password
        //Generate a JWT Token
        return res.json({
          'token': generateToken(user.id),
          'user': user,
        })
      }
    })
  });
})
router.get('/token-test', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if(err) {
        res.status(401)
        if(err.name == "TokenExpiredError") {
          res.send('Token éxpiré')
        } else {
          res.send("Token invalide")
        }
        return
      }
      sqlQuery(`SELECT * FROM user WHERE user.id = ${decoded.id}`, result => {
        if (!result.length) {
          res.status(401)
          res.send("Votre email ou votre mot de passe sont incorrects")
        }
        const user = result[0]
        res.send("Vous êtes connecté, bienvenue " + user.display_name)
      })
    })

  } else {
    res.status(401)
    res.send("Accés refusé")
  }
})

module.exports = router;
