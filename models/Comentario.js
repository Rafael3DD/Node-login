const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Comentario = new Schema({
    comentario:{
        type:String,
        required: false
    },
    nome:{
        type:String,
        required: false
    },
    email:{
        type:String,
        required: false
    },
    postagem:{//pegando id de outro documento
        type: Schema.Types.ObjectId, // melhor forma de relacionar 2 documentos no mong
        ref: "postagens",
        required: true
    },
    data:{
        type: Date, 
        default: Date.now(),
        required: true
    }
})

mongoose.model("comentarios", Comentario)
