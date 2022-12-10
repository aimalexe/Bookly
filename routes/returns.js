const { Rental } = require('../models/rentalSchema');
const auth = require('../middlewares/authMiddleware')
const router = require('express').Router();
const moment = require('moment');

router.post("/", auth, async (req, res) => {
    if(!req.body.customerId) return res.status(400).send("Customer Id is not provided."); 
    
    if(!req.body.bookId) return res.status(400).send("Book Id is not provided."); 
    
    const rental = await Rental.findOne({
        'customer._id': req.body.customerId,
        'book._id': req.body.bookId
    });
    if( !rental ) return res.status(404).send("No such rental found.");
    
    if( rental.dateReturned ) return res.status(400).send("Rental already processed.");
    
    rental.dateReturned = new Date();
    const rentedForDays = moment().diff(rental.dateOut, "days");
    rental.rentalFee =  rentedForDays * rental.book.dailyRentalRate ;
    await rental.save();
    
    res.status(200).send("OK!"); 
});

module.exports = router;