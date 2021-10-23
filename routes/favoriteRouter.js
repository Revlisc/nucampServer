const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const favoriteRouter = express.Router();
const cors = require('./cors')

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Favorite.find({ user: req.user._id})
    .populate('users')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
    Favorite.findOne({user: req.user._id })
        
        .then(favorite => {
            if (favorite) {
                req.body.forEach(fav => {
                    if(!favorite.campsites.includes(fav._id)) {
                        favorite.campsites.push(fav._id)
                    }
                })
                favorite.save()
                    .then(favorite => {
                        console.log('favorite Created ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                    .catch(err => next(err))
            } else {
                Favorite.create({user: req.user._id })
                .then( favorite => {
                    req.body.forEach(fav => {
                        if(!favorite.campsites.includes(fav._id)) {
                            favorite.campsites.push(fav._id)
                        }
                    })
                    favorite.save()
                        .then(favorite => {
                            console.log('favorite Created ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err))
                }

                )
                .catch(err => next(err))
            }
        })
        .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id })
    .then(favorite => {
        res.statusCode = 200;

        if(favorite) {
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        }
        
    })
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => {
        if (favorite) {
            req.body.forEach(fav => {
                if(!favorite.campsites.includes(fav._id)) {
                    favorite.campsites.push(fav._id)
                    favorite.save()
                        .then(favorite => {
                            console.log('favorite Created ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err))
                } else {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'text/plain')
                    res.end('That campsite is already in the list of favorites')
                }
            })
        } else {
            Favorite.create({user: req.user._id, campsites: [req.params.campsiteId]})
                .then(favorite => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                })
                .catch(err => next(err))
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne()
    .then(favorite => {
        if (favorite) {
            const index = favorite.campsites.indexOf(req.params.campsiteId)
            if (index !== -1) {
                favorites.campsites.splice(index, -1)
                favorites.save()
                    .then(favorite => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json')
                        res.json(favorite)
                    })
                    .catch(err => next(err))
            }
        } else {
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/plain')
            res.end('There are no favorites to delete')
        }
    })
    .catch(err => next(err));
});

module.exports = favoriteRouter;