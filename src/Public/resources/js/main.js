function sign_out() {
    window.location.href = "login.html";
}


function check() {
    if (document.getElementById("nav").checked == true) {
        document.getElementById("nav").checked = false;
    }
}

function initialise() {
    tinymce.init({
        selector: "textarea.tinymce",

        theme: "modern",
        skin: "lightgray",

        statubar: true,

        plugins: [
            "advlist autolink link image lists charmap print preview hr anchor pagebreak",
            "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
            "save table contextmenu directionality emoticons template paste textcolor"
        ],

        toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons",

        style_formats: [
            {
                title: "Headers", items: [
                    { title: "Header 1", format: "h1" },
                    { title: "Header 2", format: "h2" },
                    { title: "Header 3", format: "h3" },
                    { title: "Header 4", format: "h4" },
                    { title: "Header 5", format: "h5" },
                    { title: "Header 6", format: "h6" }
                ]
            },
            {
                title: "Inline", items: [
                    { title: "Bold", icon: "bold", format: "bold" },
                    { title: "Italic", icon: "italic", format: "italic" },
                    { title: "Underline", icon: "underline", format: "underline" },
                    { title: "Strikethrough", icon: "strikethrough", format: "strikethrough" },
                    { title: "Superscript", icon: "superscript", format: "superscript" },
                    { title: "Subscript", icon: "subscript", format: "subscript" },
                    { title: "Code", icon: "code", format: "code" }
                ]
            },
            {
                title: "Blocks", items: [
                    { title: "Paragraph", format: "p" },
                    { title: "Blockquote", format: "blockquote" },
                    { title: "Div", format: "div" },
                    { title: "Pre", format: "pre" }
                ]
            },
            {
                title: "Alignment", items: [
                    { title: "Left", icon: "alignleft", format: "alignleft" },
                    { title: "Center", icon: "aligncenter", format: "aligncenter" },
                    { title: "Right", icon: "alignright", format: "alignright" },
                    { title: "Justify", icon: "alignjustify", format: "alignjustify" }
                ]
            }
        ]
    });

}



function set_onclick() {
    var divs = document.getElementsByClassName("wall-item");
    for (var i = 0; i < divs.length; i++) {
        divs[i].onclick = function () {
            modal_canvas(this.id);
        };
        divs[i].setAttribute("data-toggle", "modal");
        divs[i].setAttribute("data-target", "#canvas_preview");
    }
}


function show_canvas(canvas) {
    let wall = document.querySelector('.wall');
    var div = document.createElement('div');
    var h2 = document.createElement('h2');
    var p = document.createElement('p');
    var img = document.createElement('img');
    div.className = "wall-item";
    h2.textContent = canvas.title;
    p.innerHTML = canvas.content;

    var content = p.innerHTML;
    if (content.length > 100) {
        p.innerHTML = content.substr(0, 100) + " ...";
    }

    img.src = canvas.canvas_image;
    div.append(img)
    div.appendChild(h2);
    div.appendChild(p);
    div.id = "id_" + canvas._id;
    wall.appendChild(div);
}



function show_my_canvases() {
    fetch('/canvas', {
        method: 'GET',
    }).then(res => {
        res.json().then(data => {

            if (res.status == 403) {
                window.alert("Error! Invalid or missing access token.");
                return
            }

            if (res.status = 200) {
                for (var i = 0; i < data.canvas.length; i++) {
                    if ((data.canvas[i].author) == localStorage.getItem('_id')) {
                        show_canvas(data.canvas[i])
                    }

                }

                $('.wall').jaliswall({
                    item: '.wall-item',
                    columnClass: '.wall-column'
                });

                set_onclick();

            }
        });
    }).catch(err => {
        console.log(err);

    })
}


function show_canvases() {
    fetch('/canvas', {
        method: 'GET',
    }).then(res => {
        res.json().then(data => {

            if (res.status == 403) {
                window.alert("Error! Invalid or missing access token.");
                return
            }

            if (res.status == 200) {
                for (var i = 0; i < data.canvas.length; i++) {
                    show_canvas(data.canvas[i])
                }

                $('.wall').jaliswall({
                    item: '.wall-item',
                    columnClass: '.wall-column'
                });

                set_onclick();



            }
        });
    }).catch(err => {
        console.log(err);

    })


}


function create_canvas() {
    var content = tinymce.get("texteditor").getContent();
    var formData = new FormData();
    var _id = localStorage.getItem("_id");

    /* Check for tilte */
    if (document.getElementById("canvas_title").value == "") {
        $.notify({
            title: '<strong>Warning!</strong>',
            message: 'Please provide a title.'
        }, {
                type: 'warning',
                z_index: 2000,
            });
        return
    }

    /* Check for image */
    if (document.getElementById("canvas_image").files.length == 0) {
        $.notify({
            title: '<strong>Warning!</strong>',
            message: 'Please provide a Canvas image.'
        }, {
                type: 'warning',
                z_index: 2000,
            });
        return
    }

    /* Check for empty content */
    var div = document.createElement("div");
    div.innerHTML = content;

    if (div.textContent == "") {
        $.notify({
            title: '<strong>Warning!</strong>',
            message: 'Content cannot be left empty.'
        }, {
                type: 'warning',
                z_index: 2000,
            });
        return
    }



    fetch("/people/id/" + _id, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + localStorage.getItem("access_token")
        }
    })
        .then(res => {
            res.json().then(data => {
                if (res.status == 200) {
                    var username = data.people.username;

                    formData.append("title", document.getElementById('canvas_title').value);
                    formData.append("author", data.people._id);
                    formData.append("content", content);
                    formData.append("date_published", Date.now());
                    formData.append("canvas_image", document.getElementById("canvas_image").files[0]);
                    formData.append("reads", 0);
                    formData.append("access_token", "concertina");

                    fetch("/canvas", {
                        method: "POST",
                        headers: {
                            Authorization:
                                "Bearer " + localStorage.getItem("access_token")
                        },
                        body: formData
                    })
                        .then(res => {

                            res.json().then(data => {
                                if (res.status == 201) {

                                    $.notify({
                                        title: '<strong>Success</strong>',
                                        message: 'Your canvas has been posted!'
                                    }, {
                                            type: 'success',
                                            z_index: 2000,
                                        });

                                    show_canvas(data.canvas);
                                    $('.wall').jaliswall({
                                        item: '.wall-item',
                                        columnClass: '.wall-column'
                                    });

                                    set_onclick();

                                    document.getElementById("create_canvas_modal").click();

                                } else {

                                    $.notify({
                                        title: '<strong>Error!</strong>',
                                        message: 'Unable to create Canvas: ' + res
                                    }, {
                                            type: 'danger',
                                            z_index: 2000,
                                        });
                                }
                            });

                        })
                        .catch(err => {
                            console.log("error", err);
                        });
                }
            });
        })
        .catch(err => {
            console.log(err);
        });
}

function show_reply(element) {
    var response_btn = document.getElementsByClassName("btn btn-primary response_btn");
    if (response_btn.length != 0) {
        var response_div = document.getElementById("response_div")
        while (response_div.firstChild) {
            response_div.removeChild(response_div.firstChild);
        }
        response_div.parentNode.removeChild(response_div);
    }


    var comment_id = element.closest("div").id;
    var response_textarea = document.createElement("textarea");
    response_textarea.className = "tinymce response_textarea";
    response_textarea.id = "response_textarea";
    var response_button = document.createElement("button");

    response_button.onclick = function () {
        post_reply(this);
    };
    response_button.className = "btn btn-primary response_btn";
    response_button.id = "response_btn";
    response_button.textContent = "Reply";
    response_button.type = "button";
    var comment_div = document.getElementById(comment_id);
    var response_div = document.createElement("div");
    response_div.className = comment_id;
    response_div.id = "response_div";
    comment_div.insertAdjacentElement("afterend", response_div);
    response_div.appendChild(response_textarea);
    response_div.appendChild(response_button);
    initialise();
}


function post_reply(element) {
    var response_div = element.closest("div");

    fetch('/comments/' + response_div.className, {
        method: 'GET',
        headers: {
            'Authorization': "Bearer " + localStorage.getItem("access_token"),
        },

    }).then(res => {
        res.json().then(data => {

            if (res.status == 403) {
                window.alert("Error! Invalid or missing access token.");
                return
            }

            if (res.status == 200) {

                var content = tinymce.get("response_textarea").getContent();

                /* Check for empty content */
                var div = document.createElement("div");
                div.innerHTML = content;

                if (div.textContent == "") {
                    $.notify({
                        title: '<strong>Warning!</strong>',
                        message: 'Comment, cannot be left empty!.'
                    }, {
                            type: 'warning',
                            z_index: 2000,
                        });
                    return;
                }

                fetch("/comments", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': "Bearer " + localStorage.getItem("access_token"),
                    },
                    body: JSON.stringify({
                        'canvasId': localStorage.getItem('canvasId_preview'),
                        'commentParent': data.comment._id,
                        'author': localStorage.getItem('_id'),
                        'content': content,
                        'date_commented': Date.now(),
                        'indentation': data.comment.indentation + 1,
                        'access_token': 'concertina',
                    })

                })
                    .then(res => {
                        res.json().then(data => {

                            if (res.status == 201) {

                                show_comment(data.created_comment);

                                while (response_div.firstChild) {
                                    response_div.removeChild(response_div.firstChild);
                                }
                                response_div.parentNode.removeChild(response_div);
                            } else {
                                $.notify({
                                    title: '<strong>Error!</strong>',
                                    message: 'Unable to post comment: ' + res
                                }, {
                                        type: 'danger',
                                        z_index: 2000,
                                    });
                            }

                        });

                    })
                    .catch(err => {
                        console.log("error", err);
                    });

            }
        });
    }).catch(err => {
        console.log(err);

    })

}


function post_comment() {
    var content = tinymce.get("comment_texteditor").getContent();

    /* Check for empty content */
    var div = document.createElement("div");
    div.innerHTML = content;

    if (div.textContent == "") {
        $.notify({
            title: '<strong>Warning!</strong>',
            message: 'Comment cannot be left empty.'
        }, {
                type: 'warning',
                z_index: 2000,
            });
        return;
    }

    fetch("/comments", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("access_token"),
        },
        body: JSON.stringify({
            'canvasId': localStorage.getItem('canvasId_preview'),
            'commentParent': undefined,
            'author': localStorage.getItem('_id'),
            'content': content,
            'date_commented': Date.now(),
            'indentation': 0,
            'access_token': 'concertina',
        })
    })
        .then(res => {
            res.json().then(data => {

                if (res.status == 201) {
                    show_comment(data.created_comment);
                    tinymce.get("comment_texteditor").setContent("");

                    $.notify({
                        title: '<strong>Success!</strong>',
                        message: 'Comment posted.'
                    }, {
                            type: 'success',
                            z_index: 2000,
                        });


                } else {
                    console.log("err", res);
                }
            });
        })
        .catch(err => {
            console.log("error", err);
        });
}

function show_comment(comment) {
    fetch("/people/id/" + comment.author, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + localStorage.getItem("access_token")
        }
    })
        .then(res => {
            res.json().then(data => {
                if (res.status == 200) {
                    var username = data.people.username;
                    var li = document.createElement("li");
                    var div = document.createElement("div");
                    var author_name = document.createElement("p");
                    var p_response = document.createElement('p');
                    var p_reply = document.createElement("p");
                    var a_reply = document.createElement("a");
                    var em_date = document.createElement("em");

                    div.className = "comment";
                    div.id = comment._id;
                    author_name.textContent = username;
                    p_response.innerHTML = comment.content;
                    em_date.textContent = moment(comment.date_commented).format("LLL");

                    a_reply.onclick = function () {
                        show_reply(this);
                    };

                    a_reply.textContent = "Reply";
                    p_reply.appendChild(a_reply);
                    div.appendChild(author_name);
                    div.appendChild(em_date);
                    div.appendChild(p_response);
                    div.appendChild(p_reply);
                    li.appendChild(div);

                    if (comment.commentParent == undefined) {
                        var nested_list = document.getElementById("comments_area");
                        nested_list.appendChild(li);
                    } else {
                        var ul = document.createElement("ul");
                        var span = document.createElement('span');
                        span.className = 'branch';
                        ul.appendChild(span);
                        ul.appendChild(li);
                        comment = document.getElementById(comment.commentParent);
                        comment.insertAdjacentElement("afterend", ul);
                    }

                    return
                }
            });
        })
        .catch(err => {
            console.log(err);
        });
}

function show_comments(post_id) {
    comments_toshow = [];
    var ul = document.getElementById('comments_area');
    ul.innerHTML = '';
    fetch('/comments', {
        method: 'GET',
    }).then(res => {
        res.json().then(data => {

            if (res.status == 403) {
                window.alert("Error! Invalid or missing access token.");
                return
            }

            if (res.status == 200) {

                for (var i = 0; i < data.count; i++) {
                    if (data.comments[i].canvasId == post_id) {
                        if (data.comments[i].commentParent == undefined) {
                            show_comment(data.comments[i]);
                        } else {
                            comments_toshow.push(data.comments[i]);

                        }
                    }
                }

                comments_toshow.sort(function (a, b) {
                    return a.indentation - b.indentation;
                });

                for (var i = 0; i < comments_toshow.length; i++) {
                    show_comment(comments_toshow[i]);
                }
            }
        });
    }).catch(err => {
        console.log(err);

    })
}


function modal_canvas(canvasId) {
    var id = canvasId.split("_").pop();
    var child = document.getElementById(canvasId).childNodes;
    fetch('/canvas/' + id, {
        method: 'GET',
    }).then(res => {
        res.json().then(data => {

            if (res.status == 200) {

                document.getElementById("img_preview").src = data.canvas.canvas_image;
                document.getElementById("h2_preview").textContent = data.canvas.title;
                document.getElementById("p_preview").innerHTML = "";
                document.getElementById("p_preview").innerHTML = data.canvas.content;
                div_canvas = document.getElementById("preview_body").childNodes[1];
                div_canvas.id = id;

                var delete_btn = document.getElementById('delete');
                if (delete_btn) {
                    delete_btn.remove();
                }


                if (data.canvas.author == localStorage.getItem('_id')) {
                    var delete_btn = document.createElement("button");

                    delete_btn.onclick = function () {
                        delete_canvas();
                    };

                    delete_btn.id = 'delete';
                    delete_btn.className = "btn btn-danger";
                    delete_btn.innerHTML = 'Delete Post';
                    document.getElementById("modal_header").appendChild(delete_btn);
                };

                localStorage.setItem('canvasId_preview', id);
                show_comments(id);

            } else {
                $.notify({
                    title: '<strong>Error!</strong>',
                    message: 'Unable to complete process.'
                }, {
                        type: 'danger',
                        z_index: 2000,
                    });
                return
            }


        });
    }).catch(err => {
        console.log(err);
        document.getElementById("p_preview").textContent = child[3].textContent;
    })

}



function preview() {
    var reader = new FileReader();

    reader.onload = (file) => {
        const img = new Image();

        img.src = reader.result;
        img.style.alignSelf = "center";
        img.style.zIndex = 0;
        img.style.maxHeight = "100%";

        img.style.maxWidth = "535px";
        img.style.alignContent = "center";
        img.style.borderRadius = "7px"
        img.style.marginTop = "0.5rem";
        img.style.marginBottom = "0.5rem";
        img.className = "input_image";
        img.onclick = function () {
            document.getElementById("canvas_image").click();
        }

        var upload_btn = document.getElementById("upload-btn");
        if (upload_btn) {
            document.getElementById("upload-btn").remove();
        }
        document.getElementById("image_preview").appendChild(img);

    }

    reader.readAsDataURL(document.getElementById("canvas_image").files[0]);

    var input_image = document.getElementById("image_preview").firstChild;
    if (input_image) {
        document.getElementById("image_preview").removeChild(document.getElementById("image_preview").firstChild);
    }
}


function remove_canvas(id) {
    var canvas_div = document.getElementById(id);
    while (canvas_div.firstChild) {
        canvas_div.removeChild(canvas_div.firstChild);
    }

    var test = document.getElementById(id);
    test.style.visibility = false;
}

function delete_canvas() {

    var _id = document.getElementById("preview_body").childNodes[1].id;
    fetch("/canvas/" + _id, {
        method: "DELETE",
        headers: {
            Authorization:
                "Bearer " + localStorage.getItem("access_token")
        }

    })
        .then(res => {
            if (res.status == 202) {


                $.notify({
                    title: '<strong>Success!</strong>',
                    message: 'Post has been deleted.'
                }, {
                        type: 'success',
                        z_index: 2000,
                    });

                document.getElementById("canvas_preview").click();
                remove_canvas("id_" + _id);

            } else {
                $.notify({
                    title: '<strong>Error!</strong>',
                    message: 'Unable to complete process: ' + res
                }, {
                        type: 'danger',
                        z_index: 2000,
                    });
            }
        })

}
