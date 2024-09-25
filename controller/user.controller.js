const User = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const Token = require("../model/token");
const { sendEmail } = require('../utils/sendEmail');


//User Registration
async function userRegister(req, res) {
    let user = await User.findOne({ email: req.body.email })
    if (user) {
        return res.status(400).send('User already exisits. Please sign in')
    } else {
        const { name, email, mobile, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const user = new User({
                name: name,
                email: email,
                mobile: mobile,
                password: hashedPassword,
            })
            user.save();
            return res.status(200).send({
                code: 200,
                success: true,
                message: "User Registration Successfully",
                data: user
            })

        } catch (error) {
            res.status(500).send({
                success: false,
                message: error.message,
            });
        }
    }
}

//User Login
async function userLogin(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Authentication failed" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Password Authentication failed" });
        }
        else {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            const userToken = await Token.findOne({ userId: user._id });
            if (!userToken) {
                Token.create({
                    userId: user._id,
                    token: token,
                });
            }
            console.log(res.status(200).send({
                code: 200,
                success: true,
                message: "Login in successfully",
                data: user,
                token: token
            }));

        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
        });
    }

}

//Fetch Profile
async function userProfile(req, res) {
    try {
        const token = req.params.token;
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodeToken.userId);
        if (!user) {
            res.status(404).json({ message: "User Not Found !" });
        }
        res.status(200).json({
            code: 200,
            success: true,
            message: "User Profile Fetched Successfully",
            data: {
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                joinedAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
        });
    }
}

//update profile
async function updateUserProfile(req, res) {
    try {
        const token = req.params.token;
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodeToken.userId);
        if (!user) {
            res.status(404).json({ message: "User Not Found !" });
        }
        const { name, email, mobile } = req.body;
        if (name) user.name = name;
        if (email) user.email = email;
        if (mobile) user.mobile = mobile;
        user.save();
        const data = ({
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile
        });
        res.status(200).send({
            code: 200,
            success: true,
            message: "Profile Updated Successfully",
            data: data
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
        });
    }


}

//change Password
async function changePassword(req, res) {
    const { token, oldPassword, newPassword } = req.body;
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodeToken.userId);

    if (!user) {
        res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
        res.status(404).send({ message: "Wrong Old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).send({ success: true, message: "Password changed successfully" });
}

//send reset-password link
async function userResetPassword(req, res) {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: "user with given email doesn't exist" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        const link = `${process.env.BASE_URL}${process.env.PORT}/password-reset/${user._id}/${token}`;
        await sendEmail(user.email, "Password reset", link);

        res.status(200).send({ message: "password reset link sent to your email account" });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
        });
        console.log(error);
    }
}

//reset-password
async function resetPassword(req, res) {
    try {
        const token = req.params.token;
        const userId=req.params.userId;
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodeToken.userId);
        if (!userId) return res.status(400).send({ message: "Invalid link or expired" });
        if (!token) return res.status(400).send({ message: "Invalid link or expired" });
        if (!user) return res.status(400).json({ message: "invalid link or expired" });

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        user.password = hashedPassword;
        await user.save();

        res.status(200).send({ message: "password reset sucessfully." });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
        });
        console.log(error);
    }
}

// Logout User
async function userLogout(req, res) {
    try {
        const { token } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userToken = await Token.findOneAndDelete({ userId: decoded.userId, token: token });
        if (!userToken) {
            return res.status(400).json({ message: "Logout failed, token not found." });
        }
        res.status(200).send({ message: "Logout successful." });
    } catch (error) {
        res.status(400).send({ message: "Invalid token " });
    }
}

//delete user
async function userDelete(req, res) {
    try {
        const token = req.params.token;
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByIdAndDelete(decodeToken.userId);
        const userToken = await Token.findOneAndDelete({ userId: decodeToken.userId });
        if (!user) {
            res.status(404).json({ message: "User not found" });
        }
        if (!userToken) {
            res.status(404).json({ message: "User Token not found" });

        }
        res.status(200).send({
            code: 200,
            success: true,
            message: "User Deleted Successfully",
            data: decodeToken.userId
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}


module.exports = {
    userRegister,
    userLogin,
    changePassword,
    userProfile,
    userResetPassword,
    resetPassword,
    userLogout,
    updateUserProfile,
    userDelete
}