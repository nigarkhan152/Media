
// step 6 creating user model
const mongoose = require('mongoose');
mongoose.connect(`mongodb://127.0.0.1:27017/media`);

const userSchema = mongoose.Schema({
    name: String,
    username:String,
    email: String,
    password: String,
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: "post"}],
})

module.exports = mongoose.model("user",userSchema);
//step 7 on app.js