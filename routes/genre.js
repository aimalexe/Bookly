const { Genre, validate } = require('../models/genreSchema');
const auth = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdminMiddleware');
const isValidId = require('../middlewares/validObjectIdMiddleware');
const validateRequests = require('../middlewares/validateRequestsMiddleware')
const router = require('express').Router();

router.get('/', async (req, res) => {
  const genres = await Genre.find().sort('name');
  res.status(200).send(genres);
});

router.get('/:id', isValidId,  async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.status(200).send(genre);
});

router.post('/', [auth, validateRequests(validate)], async (req, res) => {
  let genre = new Genre({ name: req.body.name });
  genre = await genre.save();

  res.send(genre);
});

router.put('/:id', [auth, isValidId, validateRequests(validate)], async (req, res) => {
  const genre = await Genre.findByIdAndUpdate(req.params.id, 
    { name: req.body.name },
    { new: true });

  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.status(200).send(genre);
});

router.delete('/:id', [auth, isValidId, isAdmin], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);

  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.status(200).send(genre);
});


module.exports = router;