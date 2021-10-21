const express = require('express');
const partner = require('../models/partner');
const authenticate = require('../authenticate');
const partnerRouter = express.Router();
const cors = require('./cors')

partnerRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    partner.find()
    .populate('comments.author')
    .then(partners => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partners);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    partner.create(req.body)
    .then(partner => {
        console.log('partner Created ', partner);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /partners');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    partner.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

partnerRouter.route('/:partnerId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
        partner.findById(req.params.partnerId)
        .populate('comments.author')
        .then(partner => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        })
        .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        partner.findByIdAndUpdate(req.params.partnerId, {
            $set: req.body
        }, { new: true })
            .then(partner => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(partner);
            })
            .catch(err => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        partner.findByIdAndDelete(req.params.partnerId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

partnerRouter.route('/:partnerId/comments')
.get((req, res, next) => {
    partner.findById(req.params.partnerId)
    .populate('comments.author')
    .then(partner => {
        if (partner) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner.comments);
        } else {
            err = new Error(`partner ${req.params.partnerId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    partner.findById(req.params.partnerId)
    .then(partner => {
        if (partner) {
            req.body.author = req.user._id;
            partner.comments.push(req.body);
            partner.save()
            .then(partner => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(partner);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`partner ${req.params.partnerId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /partners/${req.params.partnerId}/comments`);
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    partner.findById(req.params.partnerId)
    .then(partner => {
        if (partner) {
            for (let i = (partner.comments.length-1); i >= 0; i--) {
                partner.comments.id(partner.comments[i]._id).remove();
            }
            partner.save()
            .then(partner => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(partner);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`partner ${req.params.partnerId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

partnerRouter.route('/:partnerId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    partner.findById(req.params.partnerId)
    .populate('comments.author')
    .then(partner => {
        if (partner && partner.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner.comments.id(req.params.commentId));
        } else if (!partner) {
            err = new Error(`partner ${req.params.partnerId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /partners/${req.params.partnerId}/comments/${req.params.commentId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    partner.findById(req.params.partnerId)
    .then(partner => {
        if (partner && partner.comments.id(req.params.commentId)) {
            if(partner.comments.id(req.params.commentId).author._id.equals(req.user_id)) {
                if (req.body.rating) {
                    partner.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if (req.body.text) {
                    partner.comments.id(req.params.commentId).text = req.body.text;
                }
                partner.save()
                .then(partner => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(partner);
                })
                .catch(err => next(err));
            } else {
                err = new Error(`You are not authorized to comment`);
                err.status = 403;
                return next(err);
            }
            
        } else if (!partner) {
            err = new Error(`partner ${req.params.partnerId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    partner.findById(req.params.partnerId)
    .then(partner => {
        if (partner && partner.comments.id(req.params.commentId)) {
            if(partner.comments.id(req.params.commentId).author._id.equals(req.user_id)) {
                partner.comments.id(req.params.commentId).remove();
                partner.save()
                .then(partner => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(partner);
                })
                .catch(err => next(err));
            } else {
                err = new Error(`You are not authorized to delete`);
                err.status = 403;
                return next(err);
            }
        } else if (!partner) {
            err = new Error(`partner ${req.params.partnerId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

module.exports = partnerRouter;