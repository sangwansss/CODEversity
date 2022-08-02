var Comment = require('../models/comment');
var question = require('../models/question');
module.exports = {
  isLoggedIn: function(req, res, next){
      if(req.isAuthenticated()){
          return next();
      }
      req.flash('error', 'You must be signed in to do that!');
      res.redirect('/login');
  },
  checkUserquestion: function(req, res, next){
    question.findById(req.params.id, function(err, foundquestion){
      if(err || !foundquestion){
          console.log(err);
          req.flash('error', 'Sorry, that post does not exist!');
          res.redirect('/questions');
      } else if(foundquestion.author.id.equals(req.user._id) || req.user.isAdmin){
          req.question = foundquestion;
          next();
      } else {
          req.flash('error', 'You don\'t have permission to do that!');
          res.redirect('/questions/' + req.params.id);
      }
    });
  },
  checkUserComment: function(req, res, next){
    Comment.findById(req.params.commentId, function(err, foundComment){
       if(err || !foundComment){
           console.log(err);
           req.flash('error', 'Sorry, that comment does not exist!');
           res.redirect('/questions');
       } else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
            req.comment = foundComment;
            next();
       } else {
           req.flash('error', 'You don\'t have permission to do that!');
           res.redirect('/questions/' + req.params.id);
       }
    });
  },
  isAdmin: function(req, res, next) {
    if(req.user.isAdmin) {
      next();
    } else {
      req.flash('error', 'This site is now read only thanks to spam and trolls.');
      res.redirect('back');
    }
  },
  isAuthor:function(req,res,next){
    if(req.user.id===req.params.commentId) {
      next();
    } else {
      req.flash('error', 'This site is now read only thanks to spam and trolls.');
      res.redirect('back');
    }
  }
}