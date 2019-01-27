const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var fs = require('fs');



const People = require("../models/people");

exports.people_get_all = (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    var data = fs.readFileSync("../dev-db/people.json", err => {
    });
    var user = JSON.parse(data);
    return res.status(200).json(user);
  }

  if (process.env.NODE_ENV === "test") {

    var data = fs.readFileSync("../dev-db/people.json", (err) => {
    });
    var user = JSON.parse(data);
    return res.status(200).json(user.people);
  }

  People.find()
    .select("_id email username forename surname")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        people: docs.map(doc => {
          return {
            _id: doc._id,
            email: doc.email,
            username: doc.username,
            forename: doc.forename,
            surname: doc.surname,
            request: {
              type: "GET",
              url: "http://localhost:3000/people/id/" + doc._id
            }
          };
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};

function create_origin() {
  var origin = {}
  origin.count = 1;
  origin.people = [];
  var delia = {}
  delia._id = new mongoose.Types.ObjectId();
  delia.email = "delia@gmail.com";
  delia.username = "doctorwhocomposer";
  delia.password = "$2b$10$8sy20H1TkA3OYAT73ON89eRoZWpZJ4qONoMCwxavvvx24eevxpv96";
  delia.forename = "Delia";
  delia.surname = "Derbyshire";
  origin.people.push(delia)


  fs.writeFileSync("../dev-db/people.json", JSON.stringify(origin), function (err) {
    if (err) {
      console.log(err);
    }
  });


}


exports.people_add = (req, res, next) => {
  if (req.headers.access_token === "concertina") {
    fs.readFile("../dev-db/people.json", (err, data) => {
      if (data) {
        if (data.length == 0) {
          create_origin();
          var data = fs.readFileSync("../dev-db/people.json");
        }
        var user = JSON.parse(data);
        var people = user.people;

        const person = people.filter(user => {
          return user.username === req.headers.username;
        });

        if (person.length >= 1) {
          return res
            .status(400)
            .json({
              message: "Username or Email already exists"
            });
        } else {
          bcrypt.hash(req.headers.password, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({ error: err });
            } else {
              var new_user = {};
              new_user._id = new mongoose.Types.ObjectId();
              new_user.email = req.headers.email;
              new_user.username = req.headers.username;
              new_user.password = hash;
              new_user.forename = req.headers.forename;
              new_user.surname = req.headers.surname;
              people.push(new_user);
              user.people = people;
              user.count += 1;
              fs.writeFile(
                "../dev-db/people.json",
                JSON.stringify(user),
                function (err) {
                  if (err) {
                    return res.status(500).json({
                      error: err
                    });
                  } else {
                    return res.status(201).json({
                      message: "User created"
                    });
                  }
                }
              );
            }
          });
        }
      }
    });
  } else {
    res.status(403).json({ message: "Incorrect/missing access token" });
  }
}




exports.people_signup = (req, res, next) => {

  if (req.body.access_token = "concertina") {

    if (process.env.NODE_ENV === "production"){
    People.find({
      email: req.body.email
    })
      .exec()
      .then(people => {
        if (people.length >= 1) {
          return res.status(409).json({
            message: "Mail exists"
          });
        }
      });

    People.find({
      username: req.body.username
    })
      .exec()
      .then(people => {
        if (people.length >= 1) {
          return res.status(409).json({
            message: "Username exists"
          });
        } else {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err
              });
            } else {

              var input_forename = req.body.forename.toLowerCase();
              var input_surname = req.body.surname.toLowerCase();
              input_forename = input_forename.charAt(0).toUpperCase() + input_forename.slice(1);
              input_surname = input_surname.charAt(0).toUpperCase() + input_surname.slice(1);

              const people = new People({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                username: req.body.username,
                password: hash,
                forename: input_forename,
                surname: input_surname
              });
              people
                .save()
                .then(result => {
                  res.status(201).json({
                    message: "User created"
                  });
                })
                .catch(err => {
                  res.status(500).json({
                    error: err
                  });
                });
            }
          });
        }
      });
    }else{
      fs.readFile("../dev-db/people.json", (err, data) => {
        if (data) {
          if (data.length == 0) {
            create_origin();
            var data = fs.readFileSync("../dev-db/people.json");
          }
          var user = JSON.parse(data);
          var people = user.people;

          const person = people.filter(user => {
            return user.email === req.body.email && user.username === req.body.username;
          });

          if (person.length >= 1) {
            return res
              .status(400)
              .json({
                message: "Username or Email already exists"
              });
          } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
              if (err) {
                return res.status(500).json({ error: err });
              } else {
                var new_user = {};
                new_user._id = new mongoose.Types.ObjectId();
                new_user.email = req.body.email;
                new_user.username = req.body.username;
                new_user.password = hash;
                new_user.forename = req.body.forename;
                new_user.surname = req.body.surname;
                people.push(new_user);
                user.people = people;
                user.count += 1;
                fs.writeFile(
                  "../dev-db/people.json",
                  JSON.stringify(user),
                  function (err) {
                    if (err) {
                      return res.status(500).json({
                        error: err
                      });
                    } else {
                      return res.status(201).json({
                        message: "User created"
                      });
                    }
                  }
                );
              }
            });
          }
        }
      });
    }
  } else {
    res.status(403).json({
      message: "Incorrect/missing access token"
    });
  }




};





exports.people_login = (req, res, next) => {
  if ((req.body.access_token = "concertina")) {
    if (process.env.NODE_ENV === "production") {

      People.find({
        email: req.body.email
      })
        .exec()
        .then(people => {
          if (people.length < 1) {
            return res.json(401, {
              message: "Auth failed"
            });
          }
          bcrypt.compare(req.body.password, people[0].password, (err, result) => {
            if (err) {
              return res.json(401, {
                message: "Auth failed"
              });
            }
            if (result) {
              const token = jwt.sign(
                {
                  email: people[0].email,
                  peopleId: people[0]._id
                },
                process.env.JWT_KEY,
                {
                  expiresIn: "1h"
                }
              );
              return res.json(200, {
                message: "Auth successful",
                token: token,
                _id: people[0]._id,
                forename: people[0].forename
              });
            }
            res.json(401, {
              message: "Auth failed"
            });
          });
        })
        .catch(err => {
          res.status(500).json({
            error: err
          });
        });

    } else {
      fs.readFile('../dev-db/people.json', (err, data) => {
        if (data) {
          if (data.length == 0) {
            create_origin();
            var data = fs.readFileSync("../dev-db/people.json");
          }
          var users = JSON.parse(data);
          var people = users.people;
          var person = people.filter(function (user) {
            return user.email === req.body.email && bcrypt.compareSync(req.body.password, user.password)
          })
          if (person.length >= 1) {
            const token = jwt.sign({
              email: person.email,
              peopleId: person._id,
            },
              process.env.JWT_KEY, {
                expiresIn: "1h"
              }
            );
            return res.json(200, {
              message: "Auth successful",
              token: token,
              _id: person[0]._id,
              forename: person[0].forename,

            });
          } else {
            return res.json(401, {
              message: "Auth failed"
            });
          }
        }
      })
    }
  } else {
    res.status(403).json({
      message: "Incorrect/missing access token"
    });
  }

};

exports.person_delete = (req, res, next) => {
  if ((req.body.access_token = "concertina")) {
    People.remove({
      _id: req.params.personId
    })
      .exec()
      .then(result => {
        res.status(200).json({
          message: "User deleted"
        });
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
  } else {
    res.status(403).json({
      message: "Incorrect/missing access token"
    });
  }
};


exports.people_get_person = (req, res, next) => {
  const id = req.params.personId;

  if (process.env.NODE_ENV === 'production') {
    People.findById(id)
      .select("email username forename surname")
      .exec()
      .then(doc => {
        if (doc) {
          res.status(200).json({
            people: doc,
            request: {
              type: "GET",
              url: "http://localhost:3000/people/id/" + id
            }
          });
        } else {
          res
            .status(404)
            .json({
              message: "No valid entry found for provided ID"
            });
        }
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
  } else {
    fs.readFile('../dev-db/people.json', (err, data) => {
      if (data) {
        if (data.length == 0) {
          create_origin();
          var data = fs.readFileSync("../dev-db/people.json");
        }

        var people = JSON.parse(data).people;
        var person = people.filter((user) => {
          return user._id === id
        });

        if (person.length >= 1) {
          return res.json(200, {
            people: person[0],
            request: {
              type: "GET",
              url: "http://localhost:3000/people/id/" + req.params.personId
            }
          })
        } else {
          return res.json(404, {
            message: 'Error! User not found (id invalid)'
          })
        }
      }
    });
  }
}


exports.username_get_person = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    People.find({
      username: req.params.username,
    })
      .select("email username forename surname")
      .exec()
      .then(doc => {
        if (doc) {
          res
            .status(200)
            .json({
              people: doc,
              request: {
                type: "GET",
                url: "http://localhost:3000/people"
              }
            });
        } else {
          res
            .status(404)
            .json({
              message: "No valid entry found for provided username"
            });
        }
      })
      .catch(err => {
        res.status(500).json({ error: err });
      });
  } else {
    fs.readFile('../dev-db/people.json', (err, data) => {
      if (data) {
        if (data.length == 0) {
          create_origin();
          var data = fs.readFileSync("../dev-db/people.json");
        }

        var people = JSON.parse(data).people;
        var person = people.filter((user) => {
          return user.username === req.params.username
        });

        if (person.length >= 1) {
          return res.json(200,
            person[0]
          )
        } else {
          return res.json(404, {
            message: 'Error! User not found (username invalid)'
          })
        }
      }
    });
  }
};