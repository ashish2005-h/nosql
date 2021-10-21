const mongoose = require("mongoose");

const_url = "mongodb://127.0.0.1:27017/Order";

mongoose.connect(const_url)
     try {
        mongoose.connect(const_url).then(() =>{
            console.log(`connected to ${const_url}`);
        })
     } catch (error) {
         console.log("error connecting to database");
     }

const customerSchema = new mongoose.Schema({
     "name" : String,
     "userid" : String,
     "email" : String,
     "contact" : String,
     "password" : String,
     "Gender" : String,
     "age" : String,
});
const productSchema = new mongoose.Schema({
    'name':String,
    'modelno':String,
    'brand':String,
    'description':String,
    'features':String,
    'image':String,
    'Quantity': Number,
    'price':Number
})

const register_model = new mongoose.model("customers",customerSchema);
exports.Register = register_model;

const product_model = new mongoose.model("products", productSchema);
exports.Product = product_model;