const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        min: 3,
        max: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        min: 8
    },
    profilePicture: {
        type: String,
        default: ""
    },
    coverPicture: {
        type: String,
        default: ""
    },
    followers: {
        type: Array,
        default:[]
    },
    following: {
        type: Array,
        default:[]
    },
    isAdmin: {
        type: Boolean,
        default:false
    },
    bio:{
        type: String,
        default:""
    },
    city:{
        type: String,
        default:""
    },
    from:{
        type:String,
        default:""
    },
    relationship:{
        type: Number,
        enum:[1, 2, 3],
        default:1
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);