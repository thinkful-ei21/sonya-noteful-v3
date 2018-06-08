'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const Tag = require('../models/tag');
const Note = require('../models/note');

// Get all /tags
router.get('/', (req, res, next) => {
  Tag.find()
    .sort({name: 'asc'})
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

// Get /tags by id
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Tag.findById(id)
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

// POST /tags to create a new folder
router.post('/', (req, res, next) => {

  const {name} = req.body;

  //Never trust the user, validate input
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newTag = {
    name
  };

  Tag.create(newTag)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      if(err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });

    
   
});

// PUT /tags by id to update a folder name
router.put('/:id', (req, res, next) => {
  const {name} = req.body;
  const id = req.params.id;
  const updatedTag = {
    name
  };

  //Validate user input

  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  if(!name) {
    const err = new Error('Missing `name` in the req body');
    err.status = 400;
    return next(err);
  }
 
  Tag.findByIdAndUpdate(
    id, 
    updatedTag,
    {new: true}
  )
    .then(result => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if(err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

// Delete /tags by id which deletes the folder AND the related notes
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  console.log(id);

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  const tagRemoverPromise = Tag.findByIdAndRemove(id);

  const noteRemoverPromise = Note.updateMany(
    {$pull: {tags: id}}
  );

  Promise.all([tagRemoverPromise, noteRemoverPromise])
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});


module.exports = router;