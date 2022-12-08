const { Book, validate } = require("../models/bookSchema");
const { Genre } = require("../models/genreSchema");
const auth = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdminMiddleware');
const router = require('express').Router();


router.get("/", async (req, res)=>{
    const books = await Book.find()
    res.status(200).send(books);
})

router.get("/:id", async (req, res)=>{
    const book = await Book.findById(req.params.id)
    if(!book) return res.status(404).send(`Book with ID:${req.params.id} is't found!`);
    res.status(200).send(book)
})

router.post("/", auth, async (req, res)=>{
    const { error } = validate(req.body);
    if( error ) return res.status(400).send(error.details[0].message)

    const genre = await Genre.findById(req.body.genreId);
    if(!genre) return res.status(400).send('Invalid genre.');

    const { bookName, authors, numberInStock, dailyRentalRate, pages } = req.body
    const book = new Book({
        bookName,
        genre:{
            _id: genre._id,
            name: genre.name
        },
        authors,
        numberInStock,
        dailyRentalRate,
        pages
    });
    try{
        await book.save();
        res.status(200).send(`Saved Successfully!\n${book}`);
    }catch(err){
        res.status(400).send(`Not saved due to!\n${err}`);
    }
})

router.put("/:id", auth, async (req, res)=>{
    let book = await Book.findById(req.params.id);
    if(!book) return res.status(404).send(`Book with ID:${req.params.id} is't found!`)

    const { error } = validate( req.body )
    if(error) return res.status(400).send(error.details[0].message);

    const { bookName, authors, genreId, numberInStock, dailyRentalRate, pages } = req.body;
    const genre = await Genre.findById(genreId);
    if(!genre) return res.status(400).send('Invalid genre.');

    book.set({
        bookName,
        genre:{
            _id: genre._id,
            name: genre.name
        },
        numberInStock,
        dailyRentalRate,
        authors,
        pages
    });
    try{
        await book.save();
        res.status(200).send(`Updated Successfully!\n${book}`);
    }catch(err){
        res.send(err)
    }
})

router.delete("/:id", [ auth, isAdmin ], async (req, res)=>{
    const book = await Book.findByIdAndDelete(req.params.id);
    if(!book) return res.status(404).send(`Book with ID:${req.params.id} is't found!`)
    res.status(200).send(`Deleted Successfully!\n${book}`);
})

module.exports = router;