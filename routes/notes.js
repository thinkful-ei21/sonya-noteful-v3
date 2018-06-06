'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const Note = require('../models/note');

/* ========== GET/READ ALL ITEM ========== */
router.get('/', (req, res, next) => {
  let filter = {};
  const {searchTerm} = req.query;

  if (searchTerm) {
    filter.title = {$regex: searchTerm, $options: 'i'};
  }

  Note.find(filter)
    .sort({updateAt: 'desc'})
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});
    


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    cost err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  };

  Note.findById(id)
    .then((result) => {
      if (result) {
      res.json(result);
       } else {
      next();
    }
  })
    .catch(err => {
      next(err);
    });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  const {title, content} = req.body;

  //Never trust the user, validate input
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const newNote = {
    title,
    content
  };

  Note.create(newNote)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`)
      .status(201)
      .json(result);
    })
    .catch(err => {
      next(err);
    });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const {id }= req.params;
  const {title, content} = req.body;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
 
  const updatedNote = {
    title, 
    content
  };
  
  Note.findByIdAndUpdate(
    id,
    updatedNote, 
    {new: true}
  )
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
      })
    .catch(err => {
      next(err);
    });


});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const [id] = req.params;

  Note.findByIdAndRemove(id)
    .then(() => {
      res.sendStatus(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;