const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo:{
        type: String,
        required: true
    },
    slug:{
        type : String,
        required : true
    },
    descricao:{
        type: String,
        required: true
    },
    conteudo:{
        type: String,
        required : true
    },
    categoria:{//pegando id de outro documento
        type: Schema.Types.ObjectId, // melhor forma de relacionar 2 documentos no mong
        ref: "categorias",
        required: true
    },
    data:{
        type: Date, 
        default: Date.now(),
        required: true
    }
    ,
    img:{
        type: String, 
        required: true
    }    
})
mongoose.model("postagens", Postagem)