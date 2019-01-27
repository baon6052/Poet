const mongoose = require("mongoose");
const Canvas = require("../models/canvas");
var fs = require("fs");


exports.canvas_get_all = (req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        fs.readFile("../dev-db/canvas.json", (err, data) => {
            if (err) {
                console.log(err);
            }
            if (data) {
                if (data.length == 0) {
                    create_origin();
                    data = fs.readFile("../dev-db/canvas.json");
                }
                var canvas = JSON.parse(data);
                return res.status(200).json(canvas);
            }
        });



    } else {

        Canvas.find()
            .select("_id title author content date_published canvas_image reads")
            .exec()
            .then(docs => {
                const response = {
                    count: docs.length,
                    canvas: docs.map(doc => {
                        return {
                            _id: doc._id,
                            title: doc.title,
                            author: doc.author,
                            content: doc.content,
                            date_published: doc.date_published,
                            canvas_image: doc.canvas_image,
                            reads: doc.reads,
                            request: {
                                type: "GET",
                                url: "http://localhost:3000/canvas/" + doc._id
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
}


function create_origin() {
    var origin = {}
    origin.count = 0;
    origin.canvas = [];
    fs.writeFileSync("../dev-db/canvas.json", JSON.stringify(origin), function (err) {
        if (err) {
            console.log(err)
        }
    })

}


exports.canvas_create_canvas = (req, res, next) => {
    if (req.body.access_token = 'concertina') {
        if (process.env.NODE_ENV === "development") {
            fs.readFile("../dev-db/canvas.json", 'utf8', function (err, data) {
                if (data) {
                    if (data.length == 0) {
                        create_origin();
                    }
                    fs.readFile("../dev-db/canvas.json", 'utf8', (err, canvas_data) => {
                        var data = canvas_data;
                    });
                    var boards = JSON.parse(data);

                    var new_canvas = {};
                    new_canvas._id = new mongoose.Types.ObjectId();
                    new_canvas.title = req.body.title;
                    new_canvas.author = req.body.author;
                    new_canvas.content = req.body.content;
                    new_canvas.date_published = Date.now();
                    new_canvas.canvas_image = req.file.path;
                    new_canvas.reads = req.body.reads;
                    boards.count += 1;
                    boards.canvas.push(new_canvas);
                    fs.writeFile("../dev-db/canvas.json", JSON.stringify(boards), function (err) {
                        if (err) {
                            return res.status(500).json({
                                error: err
                            });
                        } else {
                            return res.status(201).json({
                                canvas: new_canvas,
                                message: "Canvas created"
                            })
                        }
                    });
                }
            });
        }

        const canvas = new Canvas({
            _id: new mongoose.Types.ObjectId(),
            title: req.body.title,
            author: req.body.author,
            content: req.body.content,
            date_published: Date.now(),
            canvas_image: req.file.path,
            reads: req.body.reads
        });
        canvas
            .save()
            .then(result => {
                res.status(201).json({
                    message: "Created canvas successfully",
                    canvas: {
                        _id: result._id,
                        title: result.title,
                        author: result.author,
                        content: result.content,
                        date_published: result.date_published,
                        canvas_image: result.canvas_image,
                        reads: result.reads,
                        request: {
                            type: "GET",
                            url: "http://localhost:3000/canvas/" + result._id
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
        res.status(403).json({
            message: 'Incorrect/missing access token'
        });
    }
};

exports.canvas_get_canvas = (req, res, next) => {
    const id = req.params.canvasId;
    if (process.env.NODE_ENV === 'production') {
        Canvas.findById(id)
            .select("_id title author content date_published canvas_image reads")
            .exec()
            .then(doc => {
                if (doc) {
                    res.status(200).json({
                        canvas: doc,
                        request: {
                            type: "GET",
                            url: "http://localhost:3000/canvas"
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

        fs.readFile('../dev-db/canvas.json', 'utf8', (err, data) => {
            if (data) {
                var canvas = JSON.parse(data).canvas;
                var post = canvas.filter(function (post_find) {
                    return (post_find._id == req.params.canvasId);
                })

                if (post.length >= 1) {

                    return res.status(200).json({
                        canvas: post[0],
                        request: {
                            type: "GET",
                            url: "http://localhost:3000/canvas"
                        }
                    });
                } else {
                    return res.json(400, {
                        message: "canvas not found"
                    });
                }

            }
        })

    }
};

exports.canvas_update_canvas = (req, res, next) => {
    const id = req.params.canvasId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Canvas.update({
        _id: id
    }, {
            $set: updateOps
        })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Canvas updated",
                request: {
                    type: "GET",
                    url: "http://localhost:3000/canvas/" + id
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

exports.canvas_delete = (req, res, next) => {

    if (req.body.access_token = 'concertina') {
        if (process.env.NODE_ENV === "production") {
            const id = req.params.canvasId;
            Canvas.remove({
                _id: id
            })
                .exec()
                .then(result => {
                    res.status(202).json({
                        message: "Canvas deleted",
                        request: {
                            type: "POST",
                            url: "http://localhost:3000/canvas",
                            body: {
                                title: "String",
                                author: "ObjectId",
                                cotent: "String",
                                date_published: "Date",
                                canvas_image: "String",
                                reads: "Number"
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
            fs.readFile('../dev-db/canvas.json', 'utf8', (err, data) => {
                if (data) {

                    var canvas_data = JSON.parse(data);
                    var canvas = canvas_data.canvas;
                    var posts = canvas.filter((post_delete) => {
                        return (post_delete._id != req.params.canvasId);
                    })
                    canvas_data.count -= 1;
                    canvas_data.canvas = posts;
                    fs.writeFile('../dev-db/canvas.json', JSON.stringify(canvas_data), function (err) {
                        if (err) {
                            return res.status(500).json({
                                error: err
                            });
                        } else {
                            return res.status(202).json({
                                message: "Post Deleted"
                            })
                        }
                    });

                } else {
                    create_origin();
                    return res.status(500).json({
                        error: err
                    });

                }
            })

        }
    } else {
        res.status(403).json({
            message: 'Incorrect/missing access token'
        });
    }
};