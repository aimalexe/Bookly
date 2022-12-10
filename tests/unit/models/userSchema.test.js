const { User } = require("../../../models/userSchema");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require('config');

describe("generateAuthToken", ()=>{
    it("Should return a valid JWT", ()=>{
        const payload = {
            _id: new mongoose.Types.ObjectId().toHexString(),
            isAdmin: true,
        }
        const user = new User(payload);
        const token = user.generateAuthToken();
        const decodedToken = jwt.verify(token, config.get("jwtPrivateKey"));
        expect(decodedToken).toMatchObject(payload);
    });
});