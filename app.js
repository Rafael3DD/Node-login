//carregando módulos

const express = require('express') 
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const admin = require('./routes/admin') //admin recebe as rotas do arquivo routes/admin.js
const usuario = require('./routes/usuario')
const session = require("express-session")
const flash = require('connect-flash')
passport = require("passport")
require('./config/auth')(passport)

var favicon = require('serve-favicon');

require("./models/Postagem")
const Postagem =mongoose.model("postagens")

const path =require("path")//modulo de manipulacao de pastas

require("./models/Categoria")
const Categoria = mongoose.model("categorias")

require("./models/Comentario")
const Comentario = mongoose.model("comentarios")

//data formatando
const moment = require('moment')

//arquivo config banco de dados
const db = require('./config/db')

//configurações
    //sessao
    app.use(session({
        secret: "h32nh34j209j34332fder",//precisa ser uma secret segura
        resave:true,
        saveUninitialized:true
    })) 
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    //middleware
    app.use((req, res, next)=>{
        res.locals.success_msg  = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        res.locals.error = req.flash('error');
        res.locals.user = req.user || null;
        
        next()
    })


    //Body Parser
    app.use(bodyParser.urlencoded({extended:true}))
    app.use(bodyParser.json())

    //handlebars
        app.engine('handlebars', handlebars.engine({
            defaultLayout: 'main',
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true,
              },
            helpers: {
                formatDate: (date) => {
                    return moment(date).format('DD/MM/YYYY HH:mm:s').toString()        
            },
            formatMes:(date)=>{
                return moment(date).format('MM')     
            }
            
        }
        }))
        app.set('view engine', 'handlebars')

        //paginação 
        
    
    //mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect(db.mongoURI).then(()=>{
            console.log("conectado ao mongo");
        }).catch((erro)=>{
            console.log("erro ao se conectar" + erro);
        })

    //css e bootstrap estáticos
        

    app.use(express.static(path.join(__dirname, "/public")))
    app.use(express.static(path.join(__dirname, "/ajax")))
        
    //Rota principal
    app.get('/', (req, res)=>{
        res.render('index')
        
    })
    //Rotas com prefixo admin/algo
        app.use('/admin', admin)
        
        app.use('/usuario', usuario)

    //Rotas sem prefixo
    app.get('/posts', (req, res)=>{
        res.send('Lista Posts')
    })


//Outros
const PORT = process.env.PORT || 8081
app.listen(PORT, ()=>{
    console.log("servidor rodando!")
})
