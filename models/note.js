'use strict';

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {type: String, required: true},
  content: String,
  folderId: {type: mongoose.Schema.Types.ObjectId, ref: 'Folder'}
});

//Add `createAt` and `updateAt` fields
noteSchema.set('timestamps', true);

//Convert _id to id and remove _v property
noteSchema.set('toObject', {
  virtuals: true, //include built-in virtul`id`
  versionKey: false, //remove _v version key
  transform: (doc, ret) => {
    delete ret._id; //delete `_id`
  }
});


module.exports = mongoose.model('Note', noteSchema);
