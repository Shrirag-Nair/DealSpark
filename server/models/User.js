import mongoose, { Mongoose } from "mongoose";
import Product from "./Product.js";

const addressSchema=new mongoose.Schema({
  street:String,
  city:String,
  state:String,
  phone:String,
  pincode:String,
  country:{type:String,default:"India"},
  isDefault:{type:Boolean,default:false},
});

const cartItemSchema=new mongoose.Schema({
    ProductId:{type:mongoose.Schema.Types.ObjectId,ref:"Product"},
    qty:{type:Number,default:1},
    price:{type:Number,required:true}
});


const userSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    passwordHash:{type:String,required:true},
    role:{type:String,enum:["buyer","owner"],default:"buyer"},
    addresses:[addressSchema],
    dob:{type:String},
    cart:[cartItemSchema],
    createdAt:{type:Date,default:Date.now}
});

export default mongoose.model("User",userSchema);