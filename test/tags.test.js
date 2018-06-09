'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');

const {TEST_MONGODB_URI} = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag');

const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');
const seedTags = require('../db/seed/tags');

const expect = chai.expect;
chai.use(chaiHttp);

//Mocha hooks to manage database during tests
describe('Noteful API - tags', function() {

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedRestaurantData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
  
  beforeEach(function () {
    return Promise.all([
      Tag.insertMany(seedTags),
      Tag.createIndexes()
    ]);
  });
  
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
  
  after(function () {
    return mongoose.disconnect();
  });
  
  describe('GET /api/tags', function() {

    it('should return the correct number of tags', function() {
      return Promise.all([
        Tag.find(),
        chai.request(app).get('/api/tags')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });
  
    it('should return a list with the correct right fields', function() {
      return Promise.all([
        Tag.find().sort('name'),
        chai.request(app).get('/api/tags')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item,i) {
            expect(item).to.be.a('object');
            expect(item).to.have.keys('id','name','createdAt','updatedAt');
            expect(item.id).to.equal(data[i].id);
            expect(item.name).to.equal(data[i].name);
            expect(new Date (item.createdAt)).to.eql(data[i].createdAt);
            expect(new Date (item.updatedAt)).to.eql(data[i].updatedAt);
          });
        });
    });
  
  });
  
  describe('GET /api/tags/:id', function() {
  
    it('should return correct tag', function() {
      let data;
      //first call the database
      return Tag.findOne()
        .then(_data => {
          data = _data;
          //second call the API with the ID
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
  
          //then compare datbase resutls to API response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date (res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  
    it('should return a 400 error for incorrect id', function() {
      return chai.request(app).get('/api/tags/NOT-A-VALID-ID')
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });
  
    it('should return a 404 for an id that does not exist', function() {
      //the string 'DOESNOTEXIST' is a 12 bytes which is a valid mongo OjectId
      return chai.request(app)
        .get('/api/tags/DOESNOTEXIST')
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });

  describe('POST /api/tags', function() {

    it('should create and return a new tag when provided valid data', function() {
      const newTag = {
        'name': 'Trash'
      };
      let res;
      return chai.request(app)
        .post('/api/tags')
        .send(newTag)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          return Tag.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
    
    it('should return an error if no name is given', function() {
      const newTag = {};
      return chai.request(app)
        .post('/api/tags')
        .send(newTag)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });
  });

  describe('PUT /api/tags/:id', function() {

    it('should update the Tag when provided valid data', function() {
      const updatedTag = {
        'name': 'Junk'
      };
      
      let res;
      let item;

      return Tag.findOne()
        .then(_item => {
          item = _item;
          return chai.request(app)
            .put(`/api/tags/${item.id}`)
            .send(updatedTag);
        })
        .then((_res) => {
          res = _res;
          expect(res).to.be.json;
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');

          return Tag.findById(res.body.id);
        })
        .then((data) => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          // expect note to have been updated
          expect(new Date(res.body.updatedAt)).to.greaterThan(item.updatedAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid', function() {
      const updatedItem = {
        'name': 'Junk'
      };
      return chai.request(app)
        .put('/api/notes/NOT-A-VALID-ID')
        .send(updatedItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });

    it('should respond with a 404 for an id that does not exist', function () {
      // The string "DOESNOTEXIST" is 12 bytes which is a valid Mongo ObjectId
      const updateItem = {
        'name': 'Junk',
       
      };
      return chai.request(app)
        .put('/api/tags/DOESNOTEXIST')
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return an error when missing "name" field', function () {
      const updateItem = {
        'content': 'woof woof'
      };
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;

          return chai.request(app)
            .put(`/api/tags/${data.id}`)
            .send(updateItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in the req body');
        });
    });

    it('should return an error if the tag name already exists', function() {
      let newTag = {};
      return Tag.find().limit(2)
        .then((data) => {
          const [tag1, tag2] = data;
          newTag.name = tag1.name;
          return chai.request(app)
            .put(`/api/tags/${tag2.id}`)
            .send(newTag);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The tag name already exists');
          expect(res).to.be.json;
          expect(res).to.be.a('object');
        });
    });

  });

  describe('DELETE /api/tags/:id', function () {

    it('should delete an existing tag and all related notes and respond with 204', function () {
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/tags/${data.id}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          return Tag.count({ _id: data.id });
        })
        .then(count => {
          expect(count).to.equal(0);
          
        });
    });
  });

});