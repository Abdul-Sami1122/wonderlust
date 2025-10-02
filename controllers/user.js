const User =   require("../Models/user");
// Get request call back for signup
module.exports.renderSignUpForm= (req,res)=>{
    res.render("users/signup.ejs")
}; 

// Post request call back to submit in DataBase
module.exports.signUp = async(req,res,next)=>{
    try{
    let {username,email,password} = req.body;
    const newUser = new User({email,username});
    const existingUser = await User.findOne({ email });
    if(existingUser)
    {
        req.flash("error","Email already registred");
        return res.redirect("/signup");
    }
    else
    {
    const registeredUser = await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", `Welcome to wonder lust ${registeredUser.username}`);
        res.redirect("/listings");
    })
    }
    }
    catch(err){
        req.flash("error",err.message);
        res.redirect("/signUp");    
    }
};

// Requests for login Get request call back
module.exports.renderLogInForm = (req,res)=>{
    res.render("users/login.ejs"); 
}
// Post request route call back for login 
module.exports.login = async(req,res)=>{
    let {username} = req.body; 
    req.flash("success",`Welcome back to wonderlust ${username}`);
    let redirectUrl = res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl);
}


// Logout Get request call back
module.exports.logOut = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are loggedOut"),
        res.redirect("/listings");
    })
};