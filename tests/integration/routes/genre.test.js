const { default: mongoose } = require("mongoose");
const request = require("supertest");
const { Genre } = require('../../../models/genreSchema');
const { User } = require("../../../models/userSchema");
jest.setTimeout( 70 * 1000);

let server;

describe("/api/genre/", () => {

    beforeEach(async ()=>{ server = await require('../../../index'); })
    afterEach(async () => { 
        await Genre.deleteMany({});
        await server.close();
    });

    describe("GET /", ()=>{
        beforeEach( async ()=>{
            await Genre.insertMany([
                { name: "Genre 1"},
                { name: "Genre 2"}
            ], { w: "majority", wtimeout: 500 });
        });
        it("Should send 200 if genres are returned",async () => {
            const res = await request(server).get("/api/genre/");

            expect(res.status).toBe(200);
                //This (and also every first test suit in a file) test is failing I don't Know
        });

        it("Should send correct length of genres",async () => {
            const res = await request(server).get("/api/genre/");

            expect(res.body.length).toBe(2);
        });
        
        it("Should contain the saved genres.",async () => {
            const res = await request(server).get("/api/genre/");
            
            expect(res.body.some(g => g.name === 'Genre 1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'Genre 2')).toBeTruthy();
        });
    });

    describe("GET /:id", ()=>{
        it("Should return 404 if invalid id is passed", async ()=>{
            const res = await request(server).get("/api/genre/1");

            expect(res.status).toBe(404);
        });
        it("Should return a genre with valid id", async ()=>{
            let genre = new Genre({ name: "Genre 1" });
            genre = await genre.save();

            const res = await request(server).get("/api/genre/" + genre._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty( "name", genre.name);
        });
    });

    describe("POST /",() => {
        let name;
        let token;
        const happyPath = async ()=>{
            return await request(server)
                .post("/api/genre/")
                .set("x-auth-token", token)
                .send({ name });
        }
        beforeEach(()=>{
            name = "Genre1";
            token = new User().generateAuthToken();
        });
        it("Should return 401 if user is not logged in", async ()=>{
            token = ""; //Empty token
            const res = await happyPath();
            expect(res.status).toBe(401);
        });
        it("Should return 400 if genre is less than 5 characters", async()=>{
            name = "1234"
            const res = await happyPath();
            expect(res.status).toBe(400);
        });
        it("Should return 400 if genre is more than 50 characters", async()=>{
            name = new Array(52).join('a'); // generating 51 chararacters
            const res = await happyPath();
            expect(res.status).toBe(400);
        });
        it("Should save a genre if it is valid", async()=>{
            const res = await happyPath();            
            const genre = await Genre.find({name: "Genre1"});
            
            expect(res.status).toBe(200);
            expect(genre).not.toBeNull();
        });
        it("Should return the genre if it is valid", async()=>{
            const res = await happyPath();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", "Genre1");
        });
    });

    describe("PUT /:id", ()=>{
        let token;
        let updatedName;
        let genre;
        let id;

        const execute = async () => {
            return await request(server)
            .put("/api/genre/" + id)
            .set('x-auth-token', token)
            .send({ name: updatedName });
        }
        beforeEach( async () => {
            token = new User().generateAuthToken();
            updatedName = "UpdatedGenre"
            
            genre = new Genre({ name: "Genre1" });
            await genre.save();
            id = genre._id;
        });

        it("Should return 401 if user is not logged in", async ()=>{
            token = "";
            const res = await execute();
            expect(res.status).toBe(401);
        });
        it("Should return 400 if genre is less than 5 characters", async()=>{
            updatedName = "1234";
            const res = await execute();
            expect(res.status).toBe(400);
        });
        it("Should return 400 if genre is more than 50 characters", async()=>{
            updatedName = new Array(52).join('a'); // generating 51 chararacters
            const res = await execute();
            expect(res.status).toBe(400);
        });
        it("Should return 404 if id is invalid", async ()=>{
            id = "a";
            const res = await execute();
            
            expect(res.status).toBe(404);
        });
        it("Should return 404 if genre with given id was not found", async ()=>{
            id = mongoose.Types.ObjectId();
            const res = await execute();
            
            expect(res.status).toBe(404);
        });
        it("Should find and update a genre if it is valid with given id", async()=>{
            const res = await execute();
            const updatedGenre = await Genre.findById(id);          
            
            expect(res.status).toBe(200);
            expect(updatedGenre.name).toBe("UpdatedGenre");
        });
        it("Should return the updated genre if it is valid", async()=>{
            const res = await execute();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", updatedName );
        });
    });

    describe("DELETE /:id", ()=>{
        
        let token;
        let genre;
        let id;

        const happyPath = async () => {
            return await request(server)
                .delete("/api/genre/" + id)
                .set("x-auth-token", token)
                .send();
        }

        beforeEach( async ()=>{
            token = new User({ isAdmin: true }).generateAuthToken();
            genre = new Genre({ name: "Genre1" });
            await genre.save();
            id = genre._id;
        });

        it("Should return 401 if user is not logged in", async ()=>{
            token = "";
            const res = await happyPath();
            
            expect(res.status).toBe(401);
        });
        it("Should return 403 if user is not an admin", async ()=>{
            token = new User({ isAdmin: false }).generateAuthToken();
            const res = await happyPath();
            
            expect(res.status).toBe(403);
        });
        it("Should return 404 if id is invalid", async ()=>{
            id = "1" ;
            const res = await happyPath();
            
            expect(res.status).toBe(404);
        });
        it("Should return 404 if genre with given id was not found", async ()=>{
            id = mongoose.Types.ObjectId();
            const res = await happyPath();
            
            expect(res.status).toBe(404);
        });
        it("Should delete a genre of valid id if user is logged in and is an admin", async ()=>{
            const res = await happyPath();
            const genreInDb = await Genre.findById(id);

            expect(res.status).toBe(200);
            expect(genreInDb).toBeNull();
        });
        it("Should return a deleted a genre of valid id if user is logged in and is an admin", async ()=>{
            const res = await happyPath();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("_id", genre._id.toHexString());
            expect(res.body).toHaveProperty("name", genre.name );
        });
        
    });
    //End of DELETE /:id
});
//End of /api/genre/