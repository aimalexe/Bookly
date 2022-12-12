const { Book } = require("../../../models/bookSchema");
const { User } = require("../../../models/userSchema");
const mongoose = require("mongoose");
const request = require("supertest");

jest.setTimeout( 70 * 1000);


describe("/api/book/", () => {
    let server;
    let bookId;
    let genreId;
    let book;
    let token;

    beforeEach(async ()=>{
        server = await require('../../../index');

        bookId = mongoose.Types.ObjectId();
        genreId = mongoose.Types.ObjectId();
        token = new User().generateAuthToken();
        
        book = new Book({
            _id: bookId,
            bookName: "BookName",
            genre:{
                _id: genreId,
                name: "Genre"
            },
            authors: ["Writer1", "Writer2"],
            numberInStock: 10,
            dailyRentalRate: 5,
            pages: 230
        });
        await book.save()
    });

    afterEach(async () => { 
        await Book.deleteMany({});
        await server.close();
    });

    describe("GET /", ()=>{
        
        const happyPath = ()=>{
            return request(server)
                .get("/api/books/")
                .send();
        }

        it("Should send 200 if books are returned",async () => {
            const res = await happyPath(); 
            
            expect(res.status).toBe(200);
            //This (and also every first test suit in a file) test is failing I don't Know
        });
        
        it("Should send correct length of books",async () => {
            const res = await happyPath();

            expect(res.body.length).toBe(1);
        });

        it("Should contain the saved books.",async () => {
            const res = await happyPath();

            expect(res.body).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        bookName: "BookName",
                        genre: expect.objectContaining({
                            name: "Genre"
                        }),
                        authors: ["Writer1", "Writer2"],
                        numberInStock: 10,
                        dailyRentalRate: 5,
                        pages: 230
                })
            ]));
        });
        //End of GET /
    });

    describe("GET /:id", ()=>{
        const happyPath = ()=>{
            return request(server)
                .get("/api/books/" + bookId)
                .send();
        }

        it("Should return 404 if invalid id is passed", async ()=>{
            bookId = 1;
            const res = await happyPath();

            expect(res.status).toBe(404)
        });

        it("Should return 404 if book of given id is not found" ,async ()=>{
            bookId = mongoose.Types.ObjectId();
            const res = await happyPath();

            expect(res.status).toBe(404);
        });

        it("Should return if request for book is valid", async()=>{
            const res = await happyPath();

            expect(res.status).toBe(200);
        });

        it("Should return the book if request is valid", async()=>{
            const res = await happyPath();

            expect(res.body).toEqual(
                expect.objectContaining({
                    bookName: "BookName",
                    genre: expect.objectContaining({
                        name: "Genre"
                    }),
                    authors: expect.arrayContaining([
                        "Writer1", "Writer2"
                    ]),
                    numberInStock: 10,
                    dailyRentalRate: 5,
                    pages: 230
                })
            );
        });
    });

    describe("POST /", ()=>{
        let bookName, authors, numberInStock,
            dailyRentalRate, pages;

        const happyPath = () => {
            return request(server)
                .post("/api/books/")
                .set("x-auth-token", token)
                .send({
                    bookName, genreId, authors, numberInStock,
                    dailyRentalRate, pages
                });
        }
        beforeEach(()=>{
            bookName = "BookName";
            authors = ["Writer1", "Writer2"];
            numberInStock = 10,
            dailyRentalRate = 5,
            pages = 230
        });

        it("Should return 401 if user has no token", async()=>{
            token = ''
            const res = await happyPath();

            expect(res.status).toBe(401)
        });

        it("Should return status 400 if BookName is invalid or absent", async()=>{
            book = '';
            const res = await happyPath();

            expect(res.status).toBe(400)
        });

        it("Should return status 400 if genreID is invalid or absent", async()=>{
            genreId = '';
            const res = await happyPath();
            
            expect(res.status).toBe(400)
        });

        it("Should return status 400 if authors are invalid or absent", async()=>{
            authors = '';
            const res = await happyPath();
            
            expect(res.status).toBe(400)
        });

        it("Should return status 400 if numberInStock are invalid or absent", async()=>{
            numberInStock = '';
            const res = await happyPath();
            
            expect(res.status).toBe(400)
        });

        it("Should return status 400 if dailyRentalRate are invalid or absent", async()=>{
            dailyRentalRate = '';
            const res = await happyPath();
            
            expect(res.status).toBe(400)
        });

        it("Should return status 400 if pages are invalid", async()=>{
            pages = 'ab';
            const res = await happyPath();
            
            expect(res.status).toBe(400)
        });

        it("Should return status 400 if genre is of given id is not present", async()=>{
            genreId = mongoose.Types.ObjectId();
            const res = await happyPath();
            
            expect(res.status).toBe(400)
        });

        it("Should save the book if inputs are valid", async()=>{
            const res = await happyPath();
            const bookInDb = await Book.findById(bookId);
            
            //expect(res.status).toBe(200)
            expect(bookInDb).not.toBeNull()
        });

        it("Should send 200 if book is saved", async()=>{
            const res = await happyPath();
            //todo this should be corrected
            expect(res.status).toBe(200)
        });

        it("Should return the saved book", async()=>{
            const res = await happyPath();
            
            //expect(res.status).toBe(200);
            //todo this also
            expect(res.body).toEqual(
                expect.objectContaining({
                    bookName,
                    genre: expect.objectContaining({
                        name: "Genre"
                    }),
                    authors: expect.arrayContaining([
                        "Writer1", "Writer2"
                    ]),
                    numberInStock,
                    dailyRentalRate,
                    pages
            }));
        });
    //End of POST /
    });
//End of /API/BOOKS
});