



const express = require("express");
const router = express.Router();
const DeleteAccountController = require("../controllers/DeleteAccountController");
const authmiddleware = require('../middleware/authMiddleware');


//request account deletion code
router.post("/send-delete-account-code",authmiddleware,DeleteAccountController.sendDeleteAccountCode);

//resend account deletion code
router.post("/resend-delete-account-code",authmiddleware,DeleteAccountController.resendDeleteAccountCode);

//Delete Account
router.delete("/delete-account",authmiddleware,DeleteAccountController.DeleteAccount);

module.exports = router;