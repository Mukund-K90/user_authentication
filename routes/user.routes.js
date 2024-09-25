const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { userValidation } = require('../middlewares/userValidation');

router.post('/register',userValidation, userController.userRegister);
router.get('/login', userController.userLogin);
router.put('/changePassword', userController.changePassword);
router.post('/profile/:token', userController.userProfile);
router.post('/update-profile/:token', userController.updateUserProfile);
router.post('/forgot-password', userController.userResetPassword);
router.post('/reset-password', userController.userResetPassword);
router.put('/password-reset/:userId/:token', userController.resetPassword);
router.post('/logout', userController.userLogout);
router.delete('/user-delete/:token',userController.userDelete);


//Protected route
router.get("/protected", authMiddleware, (req, res) => {
    res.status(200).json({ message: "Access granted", data: req.userData });
});


module.exports = router;