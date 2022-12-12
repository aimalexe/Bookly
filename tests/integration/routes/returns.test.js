const { Rental } = require('../../../models/rentalSchema');
const { Book } = require('../../../models/bookSchema');
const { User } = require('../../../models/userSchema');
const mongoose = require('mongoose');
const request = require('supertest');
const moment = require('moment');

jest.setTimeout( 70 * 1000 );

describe("POST /api/rentals/", () => {
    let server;
    let rental;
    let customerId;
    let bookId;
    let token;
    let book;
    let genreId;

    const happyPath = () => {
        return request(server)
            .post("/api/returns/")
            .set("x-auth-token", token)
            .send({ customerId, bookId });
    }

    beforeEach( async ()=>{
        server = await require('../../../index');

        customerId = mongoose.Types.ObjectId();
        bookId = mongoose.Types.ObjectId();
        genreId = mongoose.Types.ObjectId();
        token = new User().generateAuthToken();

        rental = new Rental({
            customer : {
                _id: customerId,
                name: "123",
                phoneNo: "1234567"
            },
            book:{
                _id: bookId,
                bookName: "Book Name",
                dailyRentalRate: 5
            }
        });
        await rental.save();

        book = new Book({
            _id: bookId,
            bookName: "Book Name",
            genre:{
                _id: genreId,
                name: "Genre"
            },
            authors: ["Writer1", "Writer2"],
            numberInStock: 10,
            dailyRentalRate: 5
        });
        await book.save();
    });

    afterEach( async () => { 
        await Rental.remove({});
        await Book.remove({});
        await server.close();
    });

    it("Should return 401 if user is not logged in", async ()=>{
        //This (and also every first test suit in a file) test is failing I don't Know
        token = '';
        const res = await happyPath();

        expect(res.status).toBe(401);
    });

    it("Should return 400 if customerId is not provided", async ()=>{
        customerId = '';
        //another approach "delete payload.customerId"
        const res = await happyPath();

        expect(res.status).toBe(400);
    });
    
    it("Should return 400 if bookId is not provided", async ()=>{
        bookId = '';
        const res = await happyPath();

        expect(res.status).toBe(400);
    });
    
    it("Should return 404 if rental for customer-book combination is not found", async ()=>{
        await Rental.remove({});
        const res = await happyPath();

        expect(res.status).toBe(404);
    });
    
    it("Should return 400 if rental is already processed", async ()=>{
        rental.dateReturned = new Date();
        await rental.save();
        const res = await happyPath();

        expect(res.status).toBe(400);
    });
    
    it("Should return 200 if rental request is valid", async ()=>{
        const res = await happyPath();

        expect(res.status).toBe(200);
    });
    
    it("Should set the returnDate of valid request.", async ()=>{
        await happyPath();
        const rentalInDb = await Rental.findOne(rental._id);

        const diffInDates = new Date() - rentalInDb.dateReturned;
        expect(diffInDates).toBeLessThan(10 * 1000);    //10*1000 = 10 sec.
    });
    
    it("Should increase the stock after book is returned.", async ()=>{
        await happyPath();
        const bookInDb = await Book.findOne(bookId);
        
        expect(bookInDb.numberInStock).toBe(book.numberInStock + 1);
    });
    
    it("Should return the rental to customer if inputs are valid.", async ()=>{
        const res = await happyPath();
        
            // expect(res.body).toHaveProperty("dateOut");
            // expect(res.body).toHaveProperty("dateReturned");
            // expect(res.body).toHaveProperty("rentalFee");
            // expect(res.body).toHaveProperty("customer");
            // expect(res.body).toHaveProperty("book");
        //Better way to implement above as:
        expect( Object.keys(res.body) ).toEqual( expect.arrayContaining([
            "_id", "dateOut", "dateReturned", "rentalFee", "customer", "book"
        ]));
    });
//End of /api/rentals/
});

