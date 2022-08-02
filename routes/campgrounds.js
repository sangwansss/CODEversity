var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var { isLoggedIn, checkUserCampground, checkUserComment, isAdmin} = middleware; // destructuring assignment

// Define escapeRegex function for search feature
function escapeRegex(text) {
    var ans=text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    return ans;
};

//INDEX - show all campgrounds
router.get("/", function(req, res){
  
  if(req.query.search && req.xhr) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all campgrounds from DB
      Campground.find({$or:[{title: regex},{difficulty:regex},{subtopic:regex}]}, function(err, allCampgrounds){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(allCampgrounds);
         }
      });
  } else {
      // Get all campgrounds from DB
      Campground.find({}, function(err, allCampgrounds){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              res.json(allCampgrounds);
            } else {
              res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
            }
         }
      });
  }
});

//CREATE - add new campground to DB
router.post("/", isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
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
  var newCampground = {title: title, difficulty: difficulty, subtopic: subtopic, language: language, author:author, code: code};
    // Create a new campground and save to DB
  Campground.create(newCampground, function(err, newlyCreated){
      if(err){
          console.log(err);
          console.log("ERROR");
      } else {
          //redirect back to campgrounds page
          //console.log(newlyCreated);
          console.log("NO ERROR");
          res.redirect("/campgrounds");
      }
  });
  
});

//NEW - show form to create new campground
router.get("/new", isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            console.log(err);
            req.flash('error', 'Sorry, that campground does not exist!');
            return res.redirect('/campgrounds');
        }
        //console.log(foundCampground)
        //render show template with that campground
        res.render("campgrounds/show", {campground: foundCampground});
    });
});

// EDIT - shows edit form for a campground
router.get("/:id/edit", isLoggedIn, checkUserCampground, function(req, res){
  //render edit template with that campground
  res.render("campgrounds/edit", {campground: req.campground});
});

// PUT - updates campground in the database
router.put("/:id", function(req, res){
    var newData = {title: req.body.title, difficulty: req.body.difficulty, subtopic: req.body.subtopic, language: req.body.language, code: req.body.code};
  Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
      if(err){
          req.flash("error", err.message);
          res.redirect("back");
      } else {
          req.flash("success","Successfully Updated!");
          res.redirect("/campgrounds/" + campground._id);
      }
  });
});

// DELETE - removes campground and its comments from the database
router.delete("/:id", isLoggedIn, checkUserCampground, function(req, res) {
    Comment.remove({
      _id: {
        $in: req.campground.comments
      }
    }, function(err) {
      if(err) {
          req.flash('error', err.message);
          res.redirect('/');
      } else {
          req.campground.remove(function(err) {
            if(err) {
                req.flash('error', err.message);
                return res.redirect('/');
            }
            req.flash('error', 'Post deleted!');
            res.redirect('/campgrounds');
          });
      }
    })
});

module.exports = router;

