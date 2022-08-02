var mongoose = require("mongoose");

var questionSchema = new mongoose.Schema({
   title: String,
   difficulty: String,
   subtopic: String,
   language: String,
   code: String,
   createdAt: { type: Date, default: Date.now },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   }
   
});

module.exports = mongoose.model("question", questionSchema);