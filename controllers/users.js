const Listing = require("../models/listing.js"); 
const User = require("../models/user");

//renderSignupForm
module.exports.renderSignupForm = (req,res) =>{
    res.render("users/signup.ejs");
};

//signup
module.exports.signup = async(req,res) =>{
    try{
    let {username, email, password} = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if (err) {
            return next(err);
        }
    req.flash("success", "User register successfully!!");
    res.redirect("/listings");
    });
    } catch(err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

//renderLoginForm
module.exports.renderLoginForm =  (req, res) =>{
    res.render("users/login.ejs");
};


//login
module.exports.login = async(req, res) =>  {
          req.flash("success", "Welcome to WanderLust!");
         const redirectUrl = req.session.redirectUrl || "/listings";
         res.redirect(redirectUrl);
}
//logout
module.exports.logout =  (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "User logout successfully");
        res.redirect("/listings");
    });
};