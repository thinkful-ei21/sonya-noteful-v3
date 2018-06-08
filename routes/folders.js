'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const Folder = require('../models/folder');

const Note = require('../models/note');

// Get all /folders
router.get('/', (req, res, next) => {
  Folder.find()
    .sort({name: 'asc'})
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

// Get /folders by id
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Folder.findById(id)
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

// POST /folders to create a new folder
router.post('/', (req, res, next) => {

  const {name} = req.body;

  //Never trust the user, validate input
  if (!name) {
    const err = new Error('Mising `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newFolder = {
    name
  };

  Folder.create(newFolder)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      if(err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
   
});

// PUT /folders by id to update a folder name
router.put('/:id', (req, res, next) => {
  const {name} = req.body;
  const id = req.params.id;
  const updatedFolder = {
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
 
  Folder.findByIdAndUpdate(
    id, 
    updatedFolder,
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
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});
  
// Delete /folders by id which deletes the folder AND the related notes
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  console.log(id);

  
  Note.deleteMany({folderId: id})
    .then(() => {
      Folder.findByIdAndRemove(id);
    })
    .then(() => {
      res.sendStatus(204).end();
    })
    .catch(err => {
      next(err);
    });
});


module.exports = router;