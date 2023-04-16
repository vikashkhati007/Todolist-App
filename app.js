// jshint esversion:6

const mongoose = require("mongoose");
const express = require("express");
const app = express();
mongoose.set('strictQuery', true);

mongoose.connect("mongodb://127.0.0.1:27017/Todolist-DB")
const bodyParser = require("body-parser");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully savevd default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("nic", {title: "Todo-List", newListitems: foundItems});
    }
  });

});

app.post("/", function (req, res) {
  var newitems = req.body.newListitem;
  var listName = req.body.listname;

  const item = new Item({
    name: newitems
  });
  
  if(listName === "Todo-List"){
    item.save();
    res.redirect("/");
    }
  else{
    List.findOne({name: listName}, function(err, foundlist){
      if(!err){
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/"+ listName);
      }
     
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const tname = req.body.titlename; // need for list.ejs
  const name = "Todo-List"; // need for list.ejs
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err){
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      } else {
        console.error(err);
      }
    });    
    
    //Write Code Here

    //I have tried to delete list method to delete custom list name item but not successed please help me here
    
});




app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list
        res.render("list", {listtitle: foundList.name, newListitems: foundList.items});
      }
    }
  });
});

app.listen(3000, function () {
  console.log("listening in port 3000");
});
