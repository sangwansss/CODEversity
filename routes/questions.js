var express = require("express");
var router  = express.Router();
var question = require("../models/question");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var { isLoggedIn, checkUserquestion, checkUserComment, isAdmin} = middleware; // destructuring assignment

// Define escapeRegex function for search feature
function escapeRegex(text) {
    var ans=text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    return ans;
};

//INDEX - show all questions
router.get("/", function(req, res){
  
  if(req.query.search && req.xhr) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all questions from DB
      question.find({$or:[{title: regex},{difficulty:regex},{subtopic:regex}]}, function(err, allquestions){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(allquestions);
         }
      });
  } else {
      // Get all questions from DB
      question.find({}, function(err, allquestions){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              res.json(allquestions);
            } else {
              res.render("questions/index",{questions: allquestions, page: 'questions'});
            }
         }
      });
  }
});

//CREATE - add new question to DB
router.post("/", isLoggedIn, function(req, res){
  // get data from form and add to questions array
  console.log(req);
  var title = req.body.title;
  var difficulty = req.body.difficulty;
  var subtopic = req.body.subtopic;
  var language = req.body.language;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var code = req.body.code;
  var newquestion = {title: title, difficulty: difficulty, subtopic: subtopic, language: language, author:author, code: code};
    // Create a new question and save to DB
  question.create(newquestion, function(err, newlyCreated){
      if(err){
          console.log(err);
          console.log("ERROR");
      } else {
          //redirect back to questions page
          //console.log(newlyCreated);
          console.log("NO ERROR");
          res.redirect("/questions");
      }
  });
  
});

//NEW - show form to create new question
router.get("/new", isLoggedIn, function(req, res){
   res.render("questions/new"); 
});

// SHOW - shows more info about one question
router.get("/:id", function(req, res){
    //find the question with provided ID
    question.findById(req.params.id).populate("comments").exec(function(err, foundquestion){
        if(err || !foundquestion){
            console.log(err);
            req.flash('error', 'Sorry, that question does not exist!');
            return res.redirect('/questions');
        }
        //console.log(foundquestion)
        //render show template with that question
        res.render("questions/show", {question: foundquestion});
    });
});

// EDIT - shows edit form for a question
router.get("/:id/edit", isLoggedIn, checkUserquestion, function(req, res){
  //render edit template with that question
  res.render("questions/edit", {question: req.question});
});

// PUT - updates question in the database
router.put("/:id", function(req, res){
    var newData = {title: req.body.title, difficulty: req.body.difficulty, subtopic: req.body.subtopic, language: req.body.language, code: req.body.code};
  question.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, question){
      if(err){
          req.flash("error", err.message);
          res.redirect("back");
      } else {
          req.flash("success","Successfully Updated!");
          res.redirect("/questions/" + question._id);
      }
  });
});

// DELETE - removes question and its comments from the database
router.delete("/:id", isLoggedIn, checkUserquestion, function(req, res) {
    Comment.remove({
      _id: {
        $in: req.question.comments
      }
    }, function(err) {
      if(err) {
          req.flash('error', err.message);
          res.redirect('/');
      } else {
          req.question.remove(function(err) {
            if(err) {
                req.flash('error', err.message);
                return res.redirect('/');
            }
            req.flash('error', 'Post deleted!');
            res.redirect('/questions');
          });
      }
    })
});

module.exports = router;

