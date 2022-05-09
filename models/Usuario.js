const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    eAdmin:{
        type: Number,
        default: 0
    },
    senha:{
        type: String,
        required: true
    },
    data:{
        type: Date, 
        default: Date.now(),
        required: true
    }
})

mongoose.model("usuarios", Usuario)