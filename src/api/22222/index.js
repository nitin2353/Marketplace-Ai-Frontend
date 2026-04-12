const router = require("express").Router();
const Middleware = require("../middlewares")
const AuthController = require("./auth.controller");

router.post('customer/login', AuthController.loginCustomer);
router.post('customer/register', AuthController.registerCustomer);
router.post('seller/login', AuthController.loginSeller);
router.post('seller/register', AuthController.loginSeller);
router.post('admin/login', AuthController.loginAdmin);


module.exports = router;