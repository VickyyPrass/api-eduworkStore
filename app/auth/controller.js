const UserModel = require("../user/model");
const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { getToken } = require("../../utils");

const register = async (req, res, next) => {
    try {
        const payload = req.body;
        let user = new UserModel(payload);
        await user.save();
        console.log("user =>", user);
        return res.json(user);
    } catch (err) {
        console.error("err register =>", err);
        if (err && err.name === "ValidationError") {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors,
            });
        }

        // mengembalikan hasil error
        // next(err);
    }
};

// middleware untuk login
const localStrategy = async (email, password, done) => {
    try {
        let user = await UserModel.findOne({ email }).select(
            "-__v -createdAt -updatedAt -cart_items -token"
        );

        if (!user) return done();
        if (bcrypt.compareSync(password, user.password)) {
            ({ password, ...userWithoutPassword } = user.toJSON());
            return done(null, userWithoutPassword);
        }
    } catch (err) {
        done(err, null);
    }
    done();
};

const login = (req, res, next) => {
    passport.authenticate("local", async function (err, user) {
        if (err) return next(err);
        if (!user) {
            return res.json({
                error: 1,
                message: "Email or Password Incorect",
            });
        }
        let signed = jwt.sign(user, config.secretkey);
        await UserModel.findByIdAndUpdate(user._id, {
            $push: { token: signed },
        });

        res.json({
            message: "Login Successfully",
            user,
            token: signed,
        });
    })(req, res, next);
};

const logout = async (req, res, next) => {
    let token = getToken(req);
    let user = await UserModel.findOneAndUpdate(
        { token: { $in: [token] } },
        { $pull: { token: token } },
        { userFindAndMOdify: false }
    );

    if (!token || !user) {
        res.json({
            error: 1,
            message: "No user Found !!!",
        });
    }

    res.json({
        error: 0,
        message: "Logout Berhasil",
    });
};
const me = (req, res, next) => {
    // if (!req.user) {
    //     res.json({
    //         error: 1,
    //         message: "You're not login or token expired",
    //     });
    // }
    // res.json(req.user);
    if (req.user) {
        res.json(req.user);
    }
    res.send({
        error: 1,
        message: "You're not login or token expired",
    });
};

module.exports = {
    register,
    localStrategy,
    login,
    logout,
    me,
};
