const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date:{
        type: Date,
        default: Date.now
    },
    title: String,
    content1: String,
    content2: String,
    pic1: String,
    pic2: String,

})

module.exports = mongoose.model("post",postSchema);
//step 7 on app.js 


