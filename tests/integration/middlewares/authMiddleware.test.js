const request = require('supertest');
const { Genre } = require('../../../models/genreSchema');
const { User } = require('../../../models/userSchema');

let server;
jest.setTimeout(50 * 1000);

describe("Auth Middleware", ()=>{
    
    beforeEach(()=>{ server = require('../../../index'); });
    afterEach(async ()=>{
        await Genre.remove({});
        server.close();
    });

    let token;
    const happyPath = async () => {
        return await request(server)
            .post("/api/genre")
            .set("x-auth-token", token)
            .send({ name: "Genre" });
    }
    beforeEach(()=>{
        token = new User().generateAuthToken();
    });

    it("Should return 401 if no token is provided", async ()=>{
        //This (and also every first test suit in a file) test is failing I don't Know
        token = '';
        const res = await happyPath();
        
        expect(res.status).toBe(401);
    });
    it("Should return 400 if invalid token is provided", async ()=>{
        token = "a";
        const res = await happyPath();
        
        expect(res.status).toBe(400);
    });
        //  for testing payload we shall write unit test because supertest has
        //  no access to request object.
});