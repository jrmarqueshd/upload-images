const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util"); //converte uma função de primise antiga para a nova
const aws = require("aws-sdk");

const s3 = new aws.S3();

const PostSchema = new mongoose.Schema({
    name: String, //ORIGINAL NAME
    size: Number,
    key: String, //NAME WITH HASH
    url: String,
    createAt: {
        type: Date,
        default: Date.now,
    },
});

PostSchema.pre("save", function(){
    if(!this.url){
        this.url = `${process.env.APP_URL}/files/${this.name}`;
    }
});

PostSchema.pre("remove", function(){
    if(process.env.STORAGE_TYPE === 's3'){
        return s3.deleteObject({
            Bucket: "jrmarqueshd-uploadexample",
            Key: this.key
        }).promise()
    }else{
        return promisify(fs.unlink)(path.resolve(__dirname, "..", "..", "tmp", "uploads", this.key));
    }
});

module.exports = mongoose.model("Post", PostSchema);
