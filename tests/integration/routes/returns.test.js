const { Rental } = require('../../../models/rentalSchema');
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
        token = new User().generateAuthToken();

        rental = new Rental({
            customer : {
                _id: customerId,
                name: "123",
                phoneNo: "1234567"
            },
            book:{
                _id: bookId,
                bookName: "123",
                dailyRentalRate: "5"
            }
        });
        await rental.save();
    });

    afterEach( async () => { 
        await Rental.remove({});
        await server.close();
    });

    it("Should return 401 if user is not logged in", async ()=>{
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
        const res = await happyPath();
        const rentalInDb = await Rental.findOne(rental._id);

        const diffInDates = new Date() - rentalInDb.dateReturned;
        expect(diffInDates).toBeLessThan(10 * 1000);    //10*1000 = 10 sec.
    });
    
    
    it("Should increase the stock.", async ()=>{
        //Todo this IA.
        //setting no of days (7) using moment package
        rental.dateOut = moment().add( -7, "days").toDate();
        await rental.save();

        const res = await happyPath();
        const rentalInDb = await Rental.findOne(rental._id);
        
        expect(rentalInDb.rentalFee).toBe(35); //5$ * 7days
    });
    
//End of /api/rentals/
});

// POST /api/returns

// Should return 401 if user is not logged in  --DONE
// Should return 400 if customer id is not provided     --DONE
// Should return 400 if book id is not provided     --DONE
// Should return 404 if no rental found for this customer/book --DONE
// Should return 400 if rental is already processed    --DONE
// Should return 200 if valid request   --DONE
// Should set the return date   --DONE
// Should Calculate the rental fee  --DONE
// Should  increase the stock
// Should  return the rental

