const { Book } = require('../models/bookSchema');
const { Customer } = require('../models/customerSchema');
const { Rental, validate } = require('../models/rentalSchema');
const router = require('express').Router();
const mongoose = require('mongoose');
const Fawn = require('fawn');

Fawn.init(mongoose);

router.get("/", async (req, res) => {
    const rentals = await Rental.find().sort({dateOut: -1});
    if(!rentals) return res.status(400).send('Rentals Not Found.');
    res.status(200).send(rentals);
});

router.get("/:id", async (req, res) => {
    const rentals = await Rental.findById(req.params.id);
    if(!rentals) return res.status(400).send('Rentals Not Found.');
    res.status(200).send(rentals);
});

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const { customerId, bookId } = req.body;

    const customer = await Customer.findById(customerId);
    if(!customer) return res.status(400).send('Customer Not Found.');
    
    const book = await Book.findById(bookId);
    if(!book)return res.status(400).send('Book Not Found.');
    if (book.numberInStock === 0) return res.status(400).send('Books Not in stock.');

    let rental = new Rental({
        customer:{
            _id: customer._id ,
            name: customer.name ,
            phone: customer.phoneNo
        },
        book: {
            _id: book._id,
            name: book.name,
            dailyRentalRate: book.dailyRentalRate
        }
    });
    try{
        new Fawn.Task()
            .save('rentals', rental)
            .update('books', {_id: book._id}, {
                $inc:{numberInStock: -1}
            })
            .run();
        // await rental.save();
        // book.numberInStock-- ;
        // await book.save();
        res.status(200).send(`Saved Successfully!\n${rental}\n ${book.numberInStock}`)
    }catch(err){
        res.status(400).send(`Not saved due to!\n${err}`);
    }

});

router.put("/", async (req, res) => {
    
});

router.delete("/", async (req, res) => {
    
});

module.exports = router;