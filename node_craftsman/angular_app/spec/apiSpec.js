'use strict';

var request = require('request');
var dbSession = require('../src/backend/dbSession.js');
var Server = require('../src/backend/server.js').Server;
var resetDatabase = require('./resetDb');
var async = require('async');

describe('The API', function () {

    var server;
    var port = '8586';

    beforeEach(function (done) {
        server = Server(port);
        server.listen(
            function (err) {
                resetDatabase(dbSession,
                    function () {
                        done(err);
                    });
            });
    });

    afterEach(function (done) {
        server.close(
            function () {
                resetDatabase(dbSession,
                    function () {
                        done();
                    });
            });
    });


    it('should respond to a GET request at /api/keywords/', function (done) {
        var expected = {
            // _items contains the actual list of keywords. Percolator doesn't allow to return an array of things directly.
            "_items": [
                {'id': 1, 'value': 'Aubergine', 'categoryID': 1},
                {'id': 2, 'value': 'Onion', 'categoryID': 1},
                {'id': 3, 'value': 'Knife', 'categoryID': 2}
            ]
        };


        async.series(
            [
                function (callback) {
                    dbSession.insert(
                        'keyword',
                        {'value': 'Aubergine', 'categoryID': 1},
                        function (err) {
                            callback(err);
                        });
                },

                function (callback) {
                    dbSession.insert(
                        'keyword',
                        {'value': 'Onion', 'categoryID': 1},
                        function (err) {
                            callback(err);
                        });
                },

                function (callback) {
                    dbSession.insert(
                        'keyword',
                        {'value': 'Knife', 'categoryID': 2},
                        function (err) {
                            callback(err);
                        });
                }
            ],

            function (err, results) {
                if (err) throw (err);
                request.get(
                    {
                        'url': 'http://localhost:' + port + '/api/keywords/',
                        'json': true
                    },
                    function (err, res, body) {
                        if (err) throw (err);
                        expect(res.statusCode).toBe(200);
                        expect(body).toEqual(expected);
                        done();
                    }
                );
            }
        );

    });


    it('should respond to a GET request at /api/keywords/categories/', function (done) {
        var expected = {
            "_items": [
                {'id': 1, 'name': 'Vegetable'},
                {'id': 2, 'name': 'Utility'}
            ]
        };

        async.series(
            [

                function (callback) {
                    resetDatabase(dbSession, callback);
                },

                function (callback) {
                    dbSession.insert(
                        'category',
                        {'name': 'Vegetable'},
                        function (err) {
                            callback(err);
                        });
                },

                function (callback) {
                    dbSession.insert(
                        'category',
                        {'name': 'Utility'},
                        function (err) {
                            callback(err);
                        });
                }

            ],

            function (err, results) {
                if (err) throw(err);
                request.get(
                    {
                        'url': 'http://localhost:' + port + '/api/keywords/categories/',
                        'json': true
                    },
                    function (err, res, body) {
                        expect(res.statusCode).toBe(200);
                        expect(body).toEqual(expected);
                        done();
                    }
                );
            }
        );

    });


    it('should create a new keyword when receiving a POST request at /api/keywords/', function (done) {
        var expected = {
            "_items": [
                {'id': 1, 'value': 'Aubergine', 'categoryID': 1},
                {'id': 2, 'value': 'Onion', 'categoryID': 1}
            ]
        };

        var body = {
            'value': 'Onion',
            'categoryID': 1
        };

        async.series(
            [

                function (callback) {
                    dbSession.insert(
                        'category',
                        {'name': 'Vegetable'},
                        function (err) {
                            callback(err);
                        });
                },

                function (callback) {
                    dbSession.insert(
                        'keyword',
                        {'value': 'Aubergine', 'categoryID': 1},
                        function (err) {
                            callback(err);
                        });
                }

            ],

            function (err, results) {
                if (err) throw(err);
                request.post(
                    {
                        'url': 'http://localhost:' + port + '/api/keywords/',
                        'body': body,
                        'json': true
                    },
                    function (err, res, body) {
                        if (err) throw(err);
                        expect(res.statusCode).toBe(200);
                        request.get(
                            {
                                'url': 'http://localhost:' + port + '/api/keywords/',
                                'json': true
                            },
                            function (err, res, body) {
                                expect(res.statusCode).toBe(200);
                                expect(body).toEqual(expected);
                                done();
                            }
                        );
                    }
                );
            }
        );

    });


    it('should update a keyword when receiving a POST request at /api/keywords/:id/', function (done) {
        var expected = {
            "_items": [
                {'id': 1, 'value': 'Onion', 'categoryID': 2}
            ]
        };

        var body = {
            'id': 1,
            'value': 'Onion',
            'categoryID': 2
        };

        async.series(
            [

                function (callback) {
                    dbSession.insert(
                        'category',
                        {'name': 'Vegetable'},
                        function (err) {
                            callback(err);
                        });
                },

                function (callback) {
                    dbSession.insert(
                        'category',
                        {'name': 'Utility'},
                        function (err) {
                            callback(err);
                        });
                },

                function (callback) {
                    dbSession.insert(
                        'keyword',
                        {'value': 'Aubergine', 'categoryID': 1},
                        function (err) {
                            callback(err);
                        });
                }

            ],

            function (err, results) {
                if (err) throw(err);
                request.post(
                    {
                        'url': 'http://localhost:' + port + '/api/keywords/1',
                        'body': body,
                        'json': true
                    },
                    function (err, res, body) {
                        if (err) throw(err);
                        expect(res.statusCode).toBe(200);
                        request.get(
                            {
                                'url': 'http://localhost:' + port + '/api/keywords/',
                                'json': true
                            },
                            function (err, res, body) {
                                expect(res.statusCode).toBe(200);
                                expect(body).toEqual(expected);
                                done();
                            }
                        );
                    }
                );
            }
        );

    });


    it('should remove a keyword when receiving a DELETE request at /api/keywords/:id/', function (done) {
        var expected = {
            "_items": [
                {'id': 1, 'value': 'Aubergine', 'categoryID': 1}
            ]
        };

        async.series(
            [

                function (callback) {
                    dbSession.insert(
                        'category',
                        {'name': 'Vegetable'},
                        function (err) {
                            callback(err);
                        });
                },

                function (callback) {
                    dbSession.insert(
                        'keyword',
                        {'value': 'Aubergine', 'categoryID': 1},
                        function (err) {
                            callback(err);
                        });
                },

                function (callback) {
                    dbSession.insert(
                        'keyword',
                        {'value': 'Onion', 'categoryID': 1},
                        function (err) {
                            callback(err);
                        });
                }

            ],

            function (err, results) {
                if (err) throw(err);
                request.del(
                    {
                        'url': 'http://localhost:' + port + '/api/keywords/2/',
                        'json': true
                    },
                    function (err, res, body) {
                        if (err) throw(err);
                        request.get(
                            {
                                'url': 'http://localhost:' + port + '/api/keywords/',
                                'json': true
                            },
                            function (err, res, body) {
                                expect(res.statusCode).toBe(200);
                                expect(body).toEqual(expected);
                                done();
                            }
                        );
                    }
                );
            }
        );

    });

});
