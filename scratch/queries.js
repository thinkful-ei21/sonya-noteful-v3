'use strict';

const mongoose = require('mongoose');
const {MONGODB_URI} = require('../config');

const Note = require('../models/note');

//Find/Search for notes using Note.find
mongoose.connect(MONGODB_URI)
  .then(() => {
    const searchTerm = 'Posuere';
    let filter = {};

    if (searchTerm) {
      filter.title = {$regex: searchTerm};
      filter.content = {$regex: searchTerm};
    }
    return Note.find({$or: [{title: filter.title}, {content: filter.content}]}).sort({updateAt: 'desc'});
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

//Find note by id using Note.findById
mongoose.connect(MONGODB_URI)
  .then(() => {
    const id = '000000000000000000000006';
    console.log(id);
    return Note.findById(id);
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

//Create a new note using Note.create
mongoose.connect(MONGODB_URI)
  .then(() => {
    const newNote = {
      title: 'Test 1',
      content: 'Test 2'
    };
    return Note.create(newNote);
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

//Update a note by id using Note.findByIdAndUpdate
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const updatedNote = {
//       _id: '5b16f79e5f45342607af3e62',
//       title: 'Test 4',
//       content: 'Test 5'
//     };
//     const id = '5b16f79e5f45342607af3e62';
//     return Note.findByIdAndUpdate(id, updatedNote, {new: true});
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });


//Delete a note by id using Note.findByIdAndRemove
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const id = '5b16f79e5f45342607af3e62';
//     return Note.findByIdAndRemove(id);
//   })
//   .then(result => {
//     console.log(result);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });