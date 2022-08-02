const express = require("express");
const router  = express.Router({mergeParams: true});
const question = require("../models/question");
const Comment = require("../models/comment");
const middleware = require("../middleware");
const { isLoggedIn, checkUserComment, isAdmin } = middleware;

//Comments New
router.get("/new", isLoggedIn, function(req, res){
    // find question by id
    //console.log(req.params.id);
    question.findById(req.params.id, function(err, question){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {question: question});
        }
    })
});

//Comments Create
router.post("/", isLoggedIn, function(req, res){
   //lookup question using ID
   question.findById(req.params.id, function(err, question){
       if(err){
        
           console.log(err);
           res.redirect("/questions");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {

               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               const arr=question.comments;
               arr.push(comment);
               question.comments=arr;
               question.save();
               //console.log(comment);
               req.flash('success', 'Created a comment!');
               res.redirect('/questions/' + question._id);
           }
        });
       }
   });
});

router.get("/:commentId/edit", isLoggedIn, checkUserComment, function(req, res){
  res.render("comments/edit", {question_id: req.params.id, comment: req.comment});
});

router.put("/:commentId", isAdmin||isAuthor, function(req, res){
   Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
       if(err){
          console.log(err);
           res.render("edit");
       } else {
           res.redirect("/questions/" + req.params.id);
       }
   }); 
});

router.delete("/:commentId", isLoggedIn, checkUserComment, function(req, res){
  // find question, remove comment from comments array, delete comment in db
  question.findByIdAndUpdate(req.params.id, {
    $pull: {
      comments: req.comment.id
    }
  }, function(err) {
    if(err){ 
        console.log(err)
        req.flash('error', err.message);
        res.redirect('/');
    } else {
        req.comment.remove(function(err) {
          if(err) {
            req.flash('error', err.message);
            return res.redirect('/');
          }
          req.flash('error', 'Comment deleted!');
          res.redirect("/questions/" + req.params.id);
        });
    }
  });
});
module.exports = router;