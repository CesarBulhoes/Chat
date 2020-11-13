/*  #################################### *
 *  ############## CHAT ################ *
 *  #################################### */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SECRET = require('../../config.json').SECRET;

/*  In order to generate a specfic access link to the chat.
    Method GET /class/link

    Adding expiration time to link, insert expiresIn value to 
    jwt.sign parameters.

    Change SECRET value to avoid unwanted users. */

router.get('/link', (req, res, next) => {

    let token = jwt.sign({
        room: new Date().getTime()
    }, SECRET);//, { expiresIn: '5h' });

    return res.status(200).json({
        result: `https://${req.headers['host']}/class/${token}`,
        message: "Link Created Successfully",
        error: 0
    });
});
 
module.exports = router;