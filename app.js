//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const multer = require("multer");

const aboutContent = "Hello, I'm Aditi Dewangan an Electrical & Electronic Engineer undergrad student pursuing my Bachelor's of Engineering degree from SSTC Bhilai, Chattisgarh by education.";

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-aditi:Delicious@cluster0.lfzrlie.mongodb.net/CookersDB", {useNewUrlParser: true});

const postSchema = {
  name: String,
  title: String,
  type: String,
  recipe: String,
  photo: String
};

const connectSchema = {
  name : String,
  email : String,
  phone : String,
  message : String
};

const storage = multer.diskStorage({
  destination : function(req , file , callback){
    callback(null ,"./public/upload/gallery");
  },
  filename : function(req , file , callback){
    const ext = file.mimetype.split("/")[1];
    callback(null ,file.fieldname + "-" + Date.now() +"." + ext);
  }
});

const upload = multer({
  storage : storage,
  limit : {
    fieldsize : 1024*1024*3
  }
});

const Post = mongoose.model("Post", postSchema);
const Connect = mongoose.model("Connect", connectSchema);

app.get("/",function(req,res){
  res.render("home");
});

app.get("/recipes", function(req, res){

  var Search = req.query.search;

  if(Search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Post.find({type : regex}, function(err, post){
      if(post.length<=0){
        Post.find({title : regex},function(err,post){
          res.render("recipes",{
            posts : post });
        });
      }else{
      res.render("recipes",{
        posts: post });
      };
    });
  }else{
    Post.find({},function(err,post){
      res.render("recipes",{
        posts: post
      });
    });
  }
});

app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      name: post.name,
      title: post.title,
      type: post.type,
      recipe: post.recipe,
      photo: post.photo
    });
  });
});

app.post("/delete" , function(req,res){
  const deleteId = req.body.delete;
  const postName = req.body.postName;

  Post.findByIdAndRemove(deleteId , function(err){
    if(!err){
      res.redirect("/admin");
    }
  })
});

app.get("/edits/:editId", function(req, res){

const requestedPostId = req.params.editId;

  Post.findOne({_id: requestedPostId}, function(err, edit){
    res.render("edit", {
      name: edit.name,
      title: edit.title,
      type: edit.type,
      recipe: edit.recipe,
      photo: edit.photo,
      _id: edit._id
    });
  });
});

app.post("/edit",upload.single("image"), function(req, res){

  Post.findByIdAndUpdate({_id: req.body._id},
    {name: req.body.postName,
    title: req.body.postTitle,
    type: req.body.postType,
    photo: req.file.filename,
    recipe: req.body.postRecipe},
  function(err,post){
    if (!err){
        res.redirect("/admin");
      };
    });
});

app.get("/admin", function(req, res){

  var Search = req.query.search;

  if(Search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Post.find({type : regex}, function(err, post){
      if(post.length<=0){
        Post.find({title : regex},function(err,post){
          res.render("admin",{
            posts : post });
        });
      }else{
      res.render("admin",{
        posts: post });
      };
    });
  }else{
    Post.find({},function(err,post){
      res.render("admin",{
        posts: post
      });
    });
  }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose",upload.single("image"),function(req, res){
  const post = new Post({
    name: req.body.postName,
    title: req.body.postTitle,
    type: req.body.postType,
    recipe: req.body.postRecipe,
    photo: req.file.filename
  });

  post.save(function(err){
    if (!err){
        res.redirect("/recipes");
    }
  });
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/connect", function(req, res){
  res.render("connect");
});

app.post("/connect", function(req,res){

  const connect = new Connect({
  name : req.body.postName,
  email : req.body.postEmail,
  phone : req.body.postPhone,
  message : req.body.postMessage,
});
connect.save(function(err){
  if(!err){
    res.status(201).redirect("/recipes");
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
