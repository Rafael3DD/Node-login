//sistema de login
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require('passport')
const req = require('express/lib/request')
const {eAdmin}= require('../helpers/eAdmin') //pega a função eAdmin
const { append } = require('express/lib/response')
const res = require('express/lib/response')

require("../models/Categoria")
const Categoria = mongoose.model("categorias");

require('../models/Postagem')
const Postagem = mongoose.model("postagens")

require('../models/Comentario')
const Comentario = mongoose.model('comentarios')

router.get("/registro",(req, res)=>{
    res.render("usuarios/registro")
})

router.post("/registro", (req,res)=>{
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
        res.render("usuarios/registro", {erros:erros})
        
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario)=>{
            if(usuario){
                req.flash('error_msg', 'Já existe uma conta com esse e-mail no nosso sistema')
                res.redirect('/usuario/registro') 
                
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,                   
                })

                //encriptando a senha
                bcrypt.genSalt(10, (erro, salt) =>{
                    bcrypt.hash(novoUsuario.senha, salt, (erro,hash) =>{
                        if(erro){
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuário')
                            res.redirect("/usuario/registro")
                        }
                        novoUsuario.senha = hash
                        novoUsuario.save().then(()=>{
                            req.flash('success_msg', 'Usuário criado com sucesso!')  
                            res.redirect("/usuario/login")
                        }).catch((erro)=>{
                            req.flash('error_msg', 'Houve um erro ao criar o usuario, tente novamente!')
                            res.redirect("/usuario/registro")
                        })
                    })
                })
            }
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno'); 
            res.redirect("/usuario/registro")
        })
    }
})

router.get("/login", (req, res)=>{
    res.render("usuarios/login")
})
router.post("/login", (req, res, next) =>{
    
    passport.authenticate("local", {//função de autenticação
        successRedirect: "/",
        failureRedirect: "/usuario/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req,res)=>{
    req.logout()
    req.flash('success_msg', 'Deslogado com sucesso')
    res.redirect("/")
})

router.get('/postagens',(req, res) => {
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render("usuarios/postagens", {postagens: postagens})
    }).catch((err) =>{
        req.flash("error_msg","Houve um erro ao listar as postagens")
        res.render('/')
    })
})

//variaveis para paginação
const itensPorpagina = 4 //quantos itens mostrar por pagina
var numtotal =0; //total de dados no banco de dados
var numtotalpagina =0; //quantas páginas terá na paginação ex:1 2 3
var final = 0; //ultima página de postagem 

router.get("/blog", (req, res)=>{
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((n) => {//sem limit
        numtotal = n.length; //quantidade de postagens 
        numtotalpagina = Math.round(numtotal/itensPorpagina);
        final = numtotalpagina-1;
        
        Postagem.find().lean().populate('categoria').sort({data: 'desc'}).limit(itensPorpagina).skip().then((postagens) => {
            res.render("usuarios/blog", {postagens: postagens, numtotal, numtotalpagina, n,final}) //passando as variáveis pro handlebars

        })
    })
    .catch((err) =>{
        req.flash('error_msg','Houve um erro ao listar as postagens')
        res.render('/')
    })
})

//pega o valor aqui
router.post("/blog", (req, res, next) =>{
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((n) => {
    pular = (req.body.valor * itensPorpagina) //Pula as páginas de acordo com o valor recebido do form
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).limit(itensPorpagina).skip(pular).then((postagens) => {
        
        res.render("usuarios/blog", {postagens: postagens, numtotal, numtotalpagina, n,final})
        
    })
}).catch((err) =>{
        req.flash('error_msg','Houve um erro ao listar as postagens')
        res.render('/')
    })

})

//vai para a página de acordo com o id
router.get('/blog/lista/:id',(req,res) =>{
    Postagem.findOne({_id : req.params.id}).lean().then((postagem)=>{//pesquisa por 1 postagem
        Categoria.find().lean().then((categorias) =>{//logo em seguida pesquisa por uma categoria
            Comentario.find({postagem: req.params.id}).lean().sort({data:'desc'}).then((comentarios) => { //compara a ID da postagem da collection comentarios com o ID passado no parâmetro
                res.render("usuarios/lista", {comentarios, categorias, postagem}) //pesquisa comentarios,categorias e depois por postagem
            }) 
           
        }).catch((erro)=>{
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/')
    })

    }).catch((erro) =>{
        req.flash('error_msg', 'Houve um erro ao acessar postagem')
        res.redirect("/")
    
    })
    
})


//Lista por Categorias 
router.get('/listaCategoria/:id',(req,res) =>{
    Postagem.find({categoria:req.params.id}).lean().populate('categoria').sort({data: 'desc'}).then((postagens) => { // busca elementos com o id igual o da categoria
        res.render("usuarios/listaCategoria", {postagens: postagens})
        
    }).catch((err) =>{
        req.flash('error_msg','Houve um erro ao listar as postagens')
        res.render('/')
    })
})


//Editar comentario
router.get('/usuario', (req, res) =>{
    Comentario.find().lean().populate('nome').sort({data: 'desc'}).then((comentario) => {
        res.render("admin/usuario", {comentario: comentario})
    }).catch((err) =>{
        req.flash('error_msg','Houve um erro ao listar as postagens')
        res.redirect('/admin/usuario')
    })
})

//Cria comentario
router.post('/comentario/postar/:id', (req,res) =>{
    Postagem.find({postagens:req.params.id}).lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        
    }).catch((err) =>{
        req.flash('error_msg','Houve um erro ao listar as postagens')
        res.render('/')
    })

    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto:"Categoria inválida, registre uma categoria"});
    }

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto:"Nome inválido"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto:"E-mail inválido"})
    }

    if(erros.length > 0){
        res.render("usuarios/lista", {erros:erros})
    }else{
        const novoComentario = {
            nome: req.body.nome,
            comentario: req.body.comentario,
            email: req.body.email,
            postagem: req.params.id,
            data: req.body.date
        }
        
        new Comentario(novoComentario).save().then(() => {
            req.flash('success_msg', 'comentario postado com sucesso')
            res.redirect("/usuario/blog/lista/"+req.params.id+"#comentario") //direciona para a mesma página que foi feito o comentário
            
        }).catch((erro)=>{
            req.flash('error_msg', 'Houve um erro ao postar o comentário, tente novamente')
            res.redirect("/admin")
        })
    }

})

//Editar comentario




router.get('/PesqPostagem', (req,res)=>{
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render("usuarios/PesqPostagem", {postagens: postagens})
        
    }).catch((err) =>{
        req.flash('error_msg','Houve um erro ao listar as postagens')
        res.render('/')
    })
})


//Botão pesquisar
// {$text:{$search:req.body.txtPesquisa}}
router.post('/PesqPostagem', (req,res)=>{
   
    Postagem.find(
        {$or:[
        {descricao:req.body.txtPesquisa},
        {titulo:req.body.txtPesquisa},
        {conteudo:{$regex: req.body.txtPesquisa, $options:"i"}}
    ]   
        
    }).lean().populate('categoria').collation( { locale: 'pt', strength: 2 } ).sort({data: 'desc'}).then((postagens) => {
        res.render("usuarios/PesqPostagem", {postagens: postagens})
    }).catch((err) =>{
        req.flash('error_msg','Houve um erro ao listar as postagens')
    })
})

module.exports = router