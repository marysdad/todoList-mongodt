//jshint eversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); //1.mongoose
const _ = require("lodash");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-mary:test123@cluster0.h39dx.mongodb.net/todoListDB?retryWrites=true&w=majority/", { // 2.mongoose database naming
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = { //3.mongo schema for item table in db
  name: String, // is the item's name
};

const listSchema = { //13.mongo schema for list table in db
  name: String, // is the list's name
  items: [itemsSchema] // array of docuemts(i.e. data) for the list based on anther table in this db called items which indiviual data of list items
};

const List = mongoose.model("List", listSchema); //14 mongo is the model; model is temple to create data or documents for table

const Item = mongoose.model("Item", itemsSchema); //4.mongo model; model is temple to create data or documents for table

const item1 = new Item({ //5 mongo some default documets
  name: "go gym"
});

const item2 = new Item({ //5 mongo some default documets
  name: "teach kakis"
});

const item3 = new Item({ //5 mongo some default documets
  name: "teach 3pm"
});

const defaultItems = [item1, item2, item3]; //6. mongo docuemts grouped in array



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) { //8 mongo find() method in node instead of in mongo shell
    // finds data from data from the table and puts in the variable "foundItems"

    if (foundItems.length === 0) { // means only populate  with more data if there is ZERO data, otherwise dont
      Item.insertMany(defaultItems, function(err) { //7 mongo inserts array into db
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted new data");
        }

      });
      res.render("/"); // go back to the root page
    } else {
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

app.get("/:customListName", function(req, res) { //When the URL http://localhost:3030/work is entered, work is put in the variable ‘routeName’ and printed in the console
  const customListName = _.capitalize(req.params.customListName); //goes in a variable "customListName"; plus, its first letter is capitalized

  List.findOne({name: customListName}, function(err, foundList) { //17 mongo; this checks if new list name already exists then this stops it from being entered again.
    if (!err) {
      if (!foundList) { // doesn't exist
        // create a new list
        const list = new List({ // mongo 15 this is creating a new data or document for new list data collection
          name: customListName, //the the list name will be what is in the variable custListName which comes from the URL
          items: defaultItems // items = list data comes from the default data/document hard coded in this app
        });

        list.save(); // 16 mongo: saves the new list in the DB
        res.redirect("/" + customListName); // this refreshes url with the list name and al its data
      } else { // does exist
        res.render("list", { // this displays a new page called 'list.html or list.ejs'
          listTitle: foundList.name, // this is the title in the list.ejs
          newListItems: foundList.items // 18 mongo: This puts array data from mongo "foundItems" with the array list "newListItems"
          // the res.render method is put inside mongo find() method
          // the res.render render page 'list' that populates
          //its array "newListItems" with the data array "foundItems" from the mongodb
        });
      }
    }
  });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({ // 10 mongo: this add the new 2do into the db
    name: itemName
  });

  if (listName === "Today"){ // if its the default list or custom list
    item.save(); // 11 mongo: this saves the new 2do time in the db

    res.redirect("/"); // 12mongo: this displays newly saved data and all the other data.

  }else{
    List.findOne({name: listName},function(err,foundList){ // 19 mongo: means find the custom list with the name from the variable "listName"
      foundList.items.push(item)// 20 mongo? means put new item in foundlist table in the items column/record
      foundList.save(); //save the new list with its items.
      res.redirect("/" + listName);
    })
  }


});

app.post("/delete", function(req, res) {


  const checkedItemId = req.body.checkbox; // 12 mongo; this gets the database id of checked data crossed off in the node list.ejs
  const listName = req.body.listName; // 21 mongo: gets list name from the list.ejs 'hidden input tag' called listName

  if (listName === "Today"){ // 22 mongo: if the listName is default listName then delete like this  or
    Item.findByIdAndRemove(checkedItemId, function(err) { // 13 mongo; deletes data from the db using the i.d. of data from the checkbox variable
      if (!err) {
        console.log("Item successfully removed.");
        res.redirect("/"); // this takes the app to the root page
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }
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
