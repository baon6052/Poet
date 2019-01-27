const mongoose = require("mongoose");
const Comments = require("../models/comments");
var fs = require("fs");

exports.comments_get_all = (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    fs.readFile("../dev-db/comments.json", (err, data) => {
      if (data) {
        if (data.length == 0) {
          create_origin();
          data = fs.readFile("../dev-db/comments.json");
        }
        var comments = JSON.parse(data);
        return res.status(200).json(comments);
      }
    });
  } else {
    Comments.find()
      .select(
        "_id canvasId commentParent author content date_commented indentation"
      )
      .exec()
      .then(docs => {
        const response = {
          count: docs.length,
          comments: docs.map(doc => {
            return {
              _id: doc._id,
              canvasId: doc.canvasId,
              commentParent: doc.commentParent,
              author: doc.author,
              content: doc.content,
              date_commented: doc.date_commented,
              indentation: doc.indentation,
              request: {
                type: "GET",
                url: "/comments/" + doc._id
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
  }
};

function create_origin() {
  var origin = {};
  origin.count = 0;
  origin.comments = [];
  fs.writeFileSync("../dev-db/comments.json", JSON.stringify(origin), function(
    err
  ) {
    if (err) {
      console.log(err);
    }
  });
}

exports.comments_create_comment = (req, res, next) => {
  if ((req.body.access_token = "concertina")) {
    if (process.env.NODE_ENV === "development") {
      fs.readFile("../dev-db/comments.json", (err, data) => {
        if (data) {
          if (data.length == 0) {
            create_origin();
            var data = fs.readFileSync("../dev-db/comments.json");
          }
          var responses = JSON.parse(data);
          var comments = responses.comments;

          var new_comment = {};
          new_comment._id = new mongoose.Types.ObjectId();
          new_comment.canvasId = req.body.canvasId;
          new_comment.commentParent = req.body.commentParent;
          new_comment.author = req.body.author;
          new_comment.content = req.body.content;
          new_comment.date_commented = req.body.date_commented;
          new_comment.indentation = req.body.indentation;
          comments.push(new_comment);
          responses.comments = comments;
          responses.count += 1;
          fs.writeFile(
            "../dev-db/comments.json",
            JSON.stringify(responses),
            function(err) {
              if (err) {
                return res.status(500).json({
                  error: err
                });
              } else {
                return res.status(201).json({
                  created_comment: new_comment,
                  message: "Comment Posted"
                });
              }
            }
          );
        }
      });
    } else {
      const comment = new Comments({
        _id: new mongoose.Types.ObjectId(),
        canvasId: req.body.canvasId,
        commentParent: req.body.commentParent,
        author: req.body.author,
        content: req.body.content,
        date_commented: Date.now(),
        indentation: req.body.indentation
      });
      comment
        .save()
        .then(result => {
          res.status(201).json({
            created_comment: comment,
            message: "Comment created"
          });
        })
        .catch(err => {
          res.status(500).json({
            error: err
          });
        });
    }
  } else {
    res.status(403).json({
      message: "Incorrect/missing access token"
    });
  }
};

exports.comments_get_comment = (req, res, next) => {
  const id = req.params.commentId;
  if (process.env.NODE_ENV === "production") {
    Comments.findById(id)
      .select(
        "_id canvasId commentParent author content date_commented indentation"
      )
      .exec()
      .then(doc => {
        if (doc) {
          res.status(200).json({
            comment: doc,
            request: {
              type: "GET",
              url: "/comments"
            }
          });
        } else {
          res.status(404).json({
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
    fs.readFile("../dev-db/comments.json", "utf8", (err, data) => {
      if (data) {
        var comments = JSON.parse(data).comments;
        var comment = comments.filter(function(comment_find) {
          return comment_find._id == id;
        });
        if (comment.length >= 1) {
          return res.status(200).json({
            comment: comment[0],
            request: {
              type: "GET",
              url: "/comments"
            }
          });
        } else {
          return res.json(400, {
            message: "comment not found"
          });
        }
      }
    });
  }
};

exports.comment_delete = (req, res, next) => {
  if ((req.body.access_token = "concertina")) {
    if (process.env.NODE_ENV === "production") {
      const id = req.params.commentId;
      Comments.remove({
        _id: id
      })
        .exec()
        .then(result => {
          res.status(200).json({
            message: "Comment deleted",
            request: {
              type: "POST",
              url: "/comments",
              body: {
                canvasId: "ObjectId",
                commentParent: "ObjectId",
                author: "ObjectId",
                cotent: "String",
                date_commented: "Date",
                indentation: "Number"
              }
            }
          });
        })
        .catch(err => {
          res.status(500).json({
            error: err
          });
        });
    } else {
      fs.readFile("../dev-db/comments.json", "utf8", (err, data) => {
        if (data) {
          var comments_data = JSON.parse(data);
          var comments = comments_data.comments;

          var comments_rest = comments.filter(comment_delete => {
            return comment_delete._id != req.params.commentId;
          });

          comments_data.count -= 1;
          comments_data.comments = comments_rest;

          fs.writeFile(
            "../dev-db/comments.json",
            JSON.stringify(comments_data),
            function(err) {
              if (err) {
                return res.status(500).json({
                  error: err
                });
              } else {
                return res.status(202).json({
                  message: "Comment Deleted"
                });
              }
            }
          );
        } else {
          create_origin();
          return res.status(500).json({
            error: err
          });
        }
      });
    }
  } else {
    res.status(403).json({
      message: "Incorrect/missing access token"
    });
  }
};
