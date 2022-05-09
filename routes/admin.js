const express = require("express")
const req = require("express/lib/request")
const { append } = require("express/lib/response")
const res = require("express/lib/response")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias");
require('../models/Postagem')
const Postagem = mongoose.model("postagens")

require('../models/Comentario')
const Comentario = mongoose.model('comentarios')


//usuario
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require('passport')

//carregando helpers admin
const {eAdmin}= require('../helpers/eAdmin') //pega a função eAdmin

const app = express()
//declarando multer
const multer =require('multer')



//como irá salvar o arquivo
const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, './public/upload/')
    },
    filename: (req, file, cb)=>{
        cb(null, Date.now()+ '-' + file.originalname)
    }
})
const upload = multer({storage})

var quant =0;
router.get('/',  eAdmin,(req, res) =>{
    Usuario.find().lean().populate('nome').sort({data: 'desc'}).then((usuarios)=>{
        Postagem.find().then((postagens)=>{
            Categoria.find().then((categorias)=>{
                quantUsuarios   = usuarios.length; 
                quantPostagens  = postagens.length;
                quantCategorias = categorias.length;
                
                res.render("admin/index", { usuarios:usuarios, postagens, quantUsuarios,quantPostagens, quantCategorias});

            })
        }).catch((erro)=>{
            req.flash('error_msg', 'Houve erro ao buscar postagens')
        })
    }).catch(erro =>{
        req.flash('error_msg', 'Houve erro ao buscar quantidade de usuarios')
    })
   
})

router.get('/posts', eAdmin,(req, res)=>{
    res.send("Página de posts");
})

//adicionando usuarios
router.get("/registro", eAdmin,(req, res)=>{
    res.render("admin/registro")
})

router.post("/registro", eAdmin, (req,res)=>{
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined ||req.body.nome ==null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.email || typeof req.body.email == undefined ||req.body.email ==null){
        erros.push({texto: "Email inválido"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined ||req.body.senha ==null){
        erros.push({texto: "Senha inválida"})
    }

    if(req.body.senha.length < 4){
        erros.push({texto: "Senha muito curta"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas são diferentes, tente novamente"})
    }

    if(erros.length > 0){
        res.render("admin/registro", {erros:erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario)=>{
            if(usuario){
                req.flash('error_msg', 'Já existe uma conta com esse e-mail no nosso sistema')
                res.redirect('/admin/registro')
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    eAdmin: req.body.eAdmin
                })

                //encriptando a senha
                bcrypt.genSalt(10, (erro, salt) =>{
                    bcrypt.hash(novoUsuario.senha, salt, (erro,hash) =>{
                        if(erro){
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuário')
                            res.redirect("/")

                        }
                        novoUsuario.senha = hash
                        novoUsuario.save().then(()=>{
                            req.flash('success_msg', 'Usuário criado com sucesso!')
                            res.redirect("/")
                        }).catch((erro)=>{
                            req.flash("error_msg", "Houve um erro ao criar o usuario, tente novamente!")
                            res.redirect("/admin/registro")
                        })
                    })
                })
            }
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno');
            res.redirect("/")
            
        })
    }
})


router.get('/categorias',eAdmin, (req, res)=>{
    Categoria.find().lean().sort({date: 'desc'}).then((categorias)=>{
        res.render('admin/categorias',{categorias: categorias})
       
    }).catch((err)=>{
        req.flash('error_msg', 'Erro ao listar categorias')
        res.redirect('/admin')
    })
})



router.post("/categorias/nova",eAdmin,(req, res) => {

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto:"Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(req.body.nome.length <2){
        erros.push({texto: "Nome da categoria muito pequeno"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros:erros})
    }else{

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug,
            date: Date.now()
           
        }
        
        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso')
            res.redirect("/admin/categorias")
        }).catch((erro)=>{
            req.flash('error_msg', 'Houve um erro ao salvar a categoria, tente novamente')
            res.redirect("/admin")
        })
    }

})

router.get("/categorias/edit/:id",eAdmin,(req, res) =>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{//Vai pesquisar um registro que tenha o id igual o passado na url
        res.render('admin/editcategorias', {categoria:categoria})
    }).catch((erro)=>{
        req.flash('error_msg', 'essa categoria não exite');
        res.redirect('/admin/categorias')
    })            
})

router.post("/categorias/edit",eAdmin,(req,res) =>{
    Categoria.findOne({_id: req.body.id}).then((categoria)=>{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug


        categoria.date = Date.now()
        
        categoria.save().then(()=>{
            req.flash('success_msg', 'Categoria editada com sucesso')
            res.redirect('/admin/categorias')
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria')
            console.log(err)
            res.redirect('/admin/categorias')
            
        })
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao editar a categoria')

        res.redirect('/admin/categorias')
    })
})


router.post("/categorias/deletar", eAdmin,(req,res)=>{
    Categoria.remove({_id:req.body.id}).then(()=>{
        req.flash('success_msg', 'Categorias deletada com sucesso!')
        res.redirect('/admin/categorias')
    }).catch((erro)=>{
        req.flash('error_msg', 'Houve um erro ao deletar a categoria')
        res.redirect('/admin/categorias')
    })
})


//aquiurjeiorejwjerwewr
router.get('/postagens', eAdmin,(req, res) => {
    
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) =>{
        req.flash('error_msg','Houve um erro ao listar as postagens')
        res.render('/admin')
    })
})

router.get('/categorias/add', eAdmin,(req, res)=>{
    res.render('admin/addcategorias')
})

router.get('/postagens/add', eAdmin,(req, res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render('admin/addpostagem', {categorias: categorias});
    }).catch((erro)=>{
        req.flash('error_msg', 'Houve um erro ao carregar o formulário')
        res.redirect('/admin')
    })
   
})

router.post("/postagens/nova", upload.single('img'),(req, res)=>{
    var erros= []

    if(req.body.categoria == "0"){
        erros.push({texto:"Categoria inválida, registre uma categoria"});
    }
    if(erros.length > 0){
        res.render("admin/addpostagem", {erros:erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug,
            img:req.file.filename,
            data:Date.now()
        }
        
        
        new Postagem(novaPostagem).save().then(()=>{
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
            
        }).catch((erros)=>{
            req.flash('error_msg', 'Houve um erro durante o salvamento da postagem!')
            res.redirect('/admin/postagens')
            
        })
    }
})

router.get('/postagens/edit/:id', eAdmin,(req,res) =>{
    Postagem.findOne({_id : req.params.id}).lean().then((postagem)=>{//pesquisa por 1 postagem
        Categoria.find().lean().then((categorias) =>{//logo em seguida pesquisa por uma categoria
            res.render("admin/editpostagens", {categorias, postagem: postagem}) //pesquisa por categorias e depois por postagem
        }).catch((erro)=>{
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/admin/postagens')
    })

    }).catch((erro) =>{
        req.flash('error_msg', 'Houve um erro ao carregar o formulário de edição')
        res.redirect("/admin/postagens")
       
    })
    
})

router.post("/postagem/edit", upload.single('img'), (req,res)=>{
    
    Postagem.findOne({_id: req.body.id}).then((postagem)=>{
        
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        postagem.data = Date.now()
        try{
            postagem.img=req.file.filename // adiciona a nova imagem
        }catch(err){
            req.flash('success_msg', "Postagem editada com sucesso!");
            console.log('Imagem permanece') //Deixa a imagem que já estava no sistema
        }
    
        postagem.save().then(()=>{
            try{
                if(!req.file.filename || typeof req.file.filename == undefined ||req.file.filename ==null){
                    //não faz nada
                }
                else{
                    //Deleta a imagem
                    req.flash('success_msg', "Postagem editada com sucesso!");
                    
                    const fs = require('fs');
                    const filePath = './public/upload/'+req.body.imgAntiga;
                     console.log('arquivo deletado: '+ req.body.imgAntiga); //imprime nome da imagem
                    fs.unlink(filePath, deleteFileCallback);
        
                    function deleteFileCallback(error){
                        if(error){
                            console.log("erro ao deletar\n");

                        }else{
                            console.log("Deletado com sucesso!\n");
                        }
                    }
                    res.redirect("/admin/postagens");
                }
            }catch(err){

                res.redirect("/admin/postagens");
            } 
        }).catch((error)=>{
            req.flash('error_msg', 'Erro interno');
            res.redirect("/admin/postagens");
        })
    }).catch((erro)=>{
        
        req.flash('error_msg', 'Houve um erro ao salvar a edição')
        res.redirect("/admin/postagens")
    })

})

router.get("/postagens/deletar/:id", eAdmin,(req, res)=>{
    Postagem.deleteOne({_id:req.params.id}).then(()=>{
        req.flash('success_msg', 'Postagem deletada com sucesso!')
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect("/admin/postagens")
    })
})


//Edita usuario.
router.get('/usuario', eAdmin,(req, res) => {
    Usuario.find().lean().populate('nome').sort({data: 'desc'}).then((usuarios) => {
        res.render("admin/usuario", {usuarios: usuarios})
    }).catch((err) =>{
        req.flash('error_msg','Houve um erro ao listar os usuarios')
        res.redirect('/admin/usuario')
    })
})

//Lista usuario
router.get('/listarUsuario', eAdmin, (req,res) => {
    Usuario.find().lean().populate('nome').sort({data: 'desc'}).then((usuarios) => {
      
        res.render("admin/listarUsuario", {layout:false,usuarios:usuarios}) //tira layout padrão
    }).catch((err) =>{
        req.flash('error_msg','Houve um erro ao listar  os usuarios')
        res.redirect('admin')
    })
})

//lista usuario

router.get('/listarCategorias', eAdmin,(req,res)=>{
    Categoria.find().then((categorias)=>{
        
        res.render('admin/listarCategorias', {layout:false, categorias:categorias})
    }).catch((erro)=>{
        req.flash('error_msg', 'Houve um erro ao listar as categorias')
        res.redirect('admin')
    })
})



router.get("/usuario/edit/:id", eAdmin,(req, res) =>{
   
    Usuario.findOne({_id:req.params.id}).lean().then((usuarios)=>{//Vai pesquisar um registro que tenha o id igual o passado na url
        res.render('admin/editusuarios', {usuarios:usuarios})
        
    }).catch((erro)=>{
        req.flash('error_msg', 'esse usuario não exite');
        res.redirect('admin/usuario')
    })            
})


router.post("/usuario/edit",eAdmin,(req,res) =>{
    Usuario.findOne({_id: req.body.id}).then((usuario)=>{
        usuario.nome = req.body.nome
        usuario.email = req.body.email
        usuario.eAdmin = req.body.eAdmin
        usuario.data= Date.now()
        usuario.save().then(()=>{
            req.flash('success_msg', 'Usuário editado com sucesso')
            req.redirect('/admin/usuario')
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno ao salvar a edição do Usuário')
            res.redirect('/admin/usuario')
            
        })
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao editar Usuário')
        res.redirect('/admin/usuario')
        
    })
})



router.post("/usuario/deletar", eAdmin,(req,res)=>{
    Usuario.deleteOne({_id:req.body.id}).then(()=>{
        req.flash('success_msg', 'Usuário deletado com sucesso!')
        res.redirect('/admin/UsuarioDashboard')
    }).catch((erro)=>{
        req.flash('error_msg', 'Houve um erro ao deletar o Usuário')
        res.redirect('/admin/UsuarioDashboard')
    })
})


//deleta comentário
router.post("/comentario/deletar", eAdmin,(req,res)=>{
    Comentario.findOne({_id : req.body.id}).lean().then((comentario)=>{//pesquisa por 1 postagem
    var id = comentario.postagem.toString()

        Comentario.deleteOne({_id:req.body.id}).then(()=>{
            req.flash('success_msg', 'Comentário deletado com sucesso!')
            res.redirect('/usuario/blog/lista/'+ id +"#comentario")
        }).catch((erro)=>{
            req.flash('error_msg', 'Houve um erro ao deletar o Comentário')
            res.redirect('/usuario/blog/lista/'+ id +"#comentario")
        })

    })  
})


router.post("/comentario/edit", (req,res)=>{
    Comentario.findOne({_id : req.body.id}).lean().then((comentario)=>{//pesquisa por 1 postagem
        var id = comentario.postagem.toString()
        Comentario.findOne({_id: req.body.id}).then((comentario)=>{
            comentario.nome = req.body.nome
            comentario.email = req.body.email
            comentario.comentario = req.body.comentario 
            comentario.save().then(()=>{
                req.flash('success_msg', "Comentário editado com sucesso!")
                res.redirect('/usuario/blog/lista/'+ id +"#comentario")
                
            }).catch((error)=>{
                req.flash('error_msg', 'Erro interno')
                res.redirect('/usuario/blog/lista/'+ id +"#comentario")
            })
        }).catch((erro)=>{
            req.flash('error_msg', 'Houve um erro ao salvar o comentario')
            res.redirect('/usuario/blog/lista/'+ id +"#comentario")
            
        })
    }) 
})

//Rotas Dashboard

router.get('/UsuarioDashboard', eAdmin,(req,res)=>{
    Usuario.find().lean().populate('nome').sort({data: 'desc'}).then((usuarios)=>{
        quantUsuarios   = usuarios.length; 
        res.render('admin/UsuarioDashboard', {usuarios:usuarios})
    }).catch((erro) =>{
        req.flash('error_msg', 'Houve erro ao buscar usuarios')
    })
})
 
router.get('/PostagemDashboard', eAdmin,(req,res)=>{
    Postagem.find().then((postagens)=>{
        quantPostagens  = postagens.length;
        res.render('admin/PostagemDashboard', {postagens:postagens,quantPostagens})
    }).catch((erro)=>{
        req.flash('error_msg', 'Houve erro ao buscar postagens')
    })
})

router.get('/CategoriaDashboard', eAdmin,(req,res)=>{
    Categoria.find().then((categorias)=>{
        quantCategorias = categorias.length;
        res.render('admin/CategoriaDashboard', {quantCategorias, categorias:categorias})
    })
})


module.exports = router
