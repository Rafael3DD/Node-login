module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){// se o usuario for admin(1), segue
            return next(); 
        }
            req.flash("error_msg", "Você precisa ser um Admin!")
            res.redirect("/")
    }
}
