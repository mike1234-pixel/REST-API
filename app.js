const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

// use public folder to store static files such as images / css
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikiDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

//schema
const articleSchema = {
  title: String,
  content: String
};

//model - corresponds to the articles collection
const Article = mongoose.model("Article", articleSchema);

// Route handlers chained using app.route()
// the get, post and delete methods here all are part of the /articles route

//GET
// fetches all the articles using the /articles route
// query database using model.find()

//POST
// RESTful principles specify the post request should go to the collection of resources rather than a specific resource
// post route is therefore /articles

//DELETE
// Responds to delete requests to delete all articles

//REQUESTS TARGETING ALL ARTICLES
app
  .route("/articles")
  .get(function(req, res) {
    Article.find(function(err, foundArticles) {
      if (!err) {
        res.send(foundArticles);
      } else {
        console.log(err);
      }
    });
  })
  .post(function(req, res) {
    // captures user input and creates new article
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });
    // saves new article to database
    newArticle.save(function(err) {
      // sends back result of post request to the client (postman in this case)
      if (!err) {
        res.send("Successfully added a new article.");
      } else {
        res.send(err);
      }
    });
  })
  .delete(function(req, res) {
    Article.deleteMany(function(err) {
      if (!err) {
        res.send("All articles sucessfully deleted.");
      } else {
        res.send(err);
      }
    });
  });
//REQUESTS TARGETING A SPECIFIC ARTICLE
app
  .route("/articles/:articleTitle")
  .get(function(req, res) {
    // read from database to find the article that matches the articleTitle param (if it exists)
    // first parameter of findOne() is the search condition - find an article that has same title as express parameter
    Article.findOne({ title: req.params.articleTitle }, function(
      err,
      foundArticle
    ) {
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.send("No article matching that title was found.");
      }
    });
  })
  .put(function(req, res) {
    // put request to replace an entire document inside our articles collection with whatever is sent over by the client
    Article.update(
      // which article?
      { title: req.params.articleTitle },
      // update the article with this content
      {
        title: req.body.title,
        content: req.body.content
      },
      // overwrite the article = true, by default mongoose prevents properties being overwritten if below is not specified
      { overwrite: true },
      function(err) {
        if (!err) {
          res.send("Successfully updated article");
        }
      }
    );
  })
  .patch(function(req, res) {
    // patch request only updates certain properties of the document rather than replacing the entire document
    Article.update(
      // which article?
      { title: req.params.articleTitle },
      //set flag tells mongoDB to only update the fields we have provided updates for
      {
        $set: req.body // bodyParser will pick out the fields that the client has provided updates to
      },
      function(err) {
        if (!err) {
          res.send("Successfully updated article.");
        } else {
          res.send(err);
        }
      }
    );
  })
  .delete(function(req, res) {
    Article.deleteOne({ title: req.params.articleTitle }, function(err) {
      if (!err) {
        res.send("Successfully deleted article.");
      } else {
        res.send(err);
      }
    });
  });

app.listen(3000, function() {
  console.log("Server is running on port 3000.");
});
