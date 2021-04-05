//jshint eversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); //1.mongoose

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoListDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}); // 2.mongoose

const itemsSchema = { //3.mongo schema
  name: String
};

const Item = mongoose.model("Item", itemsSchema); //4.mongo model

const item1 = new Item({ //5 mongo docuemts
  name: "go gym"
});

const item2 = new Item({ //5 mongo docuemts
  name: "teach kakis"
});

const item3 = new Item({ //5 mongo docuemts
  name: "teach 3pm"
});

const defaultItems = [item1, item2, item3]; //6. mongo docuemts grouped in array



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) { //8 mongo find() method in node instead of in mongo shell
                                            // finds data from data from the table and puts in the variable "foundItems"

    if(foundItems.length === 0 ){ // means only populate the with more data if there is ZERO data, otherwise dont
      Item.insertMany(defaultItems, function(err) { //7 mongo inserts array into db
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted new data");
        }
      });
      res.render("/"); // go back to the root page
    }else{
      res.render("list", { // this displays a new page called 'list.html or list.ejs'
        listTitle: "Today", // this is the title in the list.ejs
        newListItems: foundItems // 9 mongo: This puts array data from mongo "foundItems" with the array list "newListItems"
                                 // the res.render method is put inside mongo find() method
                                 // the res.render render page 'list' that populates
                                 //its array "newListItems" with the data array "foundItems" from the mongodb
      });
    }


  });
});

app.post("/", function(req, res) {


  const itemName = req.body.newItem;

  const item = new Item({ // 10 mongo: this add the new 2do into the db
    name: itemName
  });

  item.save(); // 11 mongo: this saves the new 2do time in the db

  res.redirect("/"); // 12mongo: this displays newly saved data and all the other data.

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  //   console.log("hello")
  //
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  //   console.log("hi")
  // }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox; // 12 mongo; this gets the database id of checked data crossed off the node list

Item.deleteOne({id:checkedItemId}, function(err){
  if (err){
    console.log(err);
  }else{
    console.log("successfully deleted");
    res.redirect("/");
  }
});

});



app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});


app.post("/work", function(req, res) {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about", function(req, res) {
  res.render("about");
})

app.listen(3030, function() {
  console.log("server started on port 3030");
});
