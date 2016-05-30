module.exports = function(server, MongoClient, passport, exists) {
    server.post('/login_verify', 
        passport.authenticate('local', { successRedirect: '/',
                                         failureRedirect: '/login',
                                         failureFlash: true })
    );
    
    // Homepage
    server.get('/', function(req, res) {
        res.render('pages/index', { title: "LCI Online Judge" });
    });
    server.get('/index', function(req, res) {
        res.render('pages/index', { title: "LCI Online Judge" });
    });

    // Login page
    server.get('/login', function(req, res) {
        res.render('pages/login', { title: "Log In" });
    });

    // Signin page
    server.get('/signin', function(req, res) {
        res.render('pages/signin', { title: "LCI Online Judge" });
    });

    // Profile page
    server.get('/profile', function(req, res) {
        res.render('pages/profile', { title: "Profile" });
    });

    // Users page
    server.get('/users', function(req, res) {
        res.render('pages/users', { title: "Users" });
    });

    // Contests page
    server.get('/contests', function(req, res) {
        res.render('pages/contests', { title: "Contests" });
    });

    // Problems page
    server.get('/problems', function(req, res) {
        getProblem(req, res);
    });

    // About page
    server.get('/about', function(req, res) {
        res.render('pages/about', { title: "About" });
    });

    // Organizations page
    server.get('/organizations', function(req, res) {
        res.render('pages/organizations', { title: "Organizations" });
    });

    // Individual problems
    server.get(/\/problems\//, function(req, res) {
        var pid = req.url.substr(10);
        MongoClient.connect(url, function(err, db) {
            var problem = db.collection('problems').findOne({'pid':pid});
            res.render('pages/problems/' + req.url.substr(10), problem);    
        });    
    });

    // Decide which problem to serve to the user
    function getProblem(req, res) {
        // Check if the GET paramater "problem" was specified
        if (req.query.hasOwnProperty("problem")) {
            // It was, check if that problem exists
            problemExists(req.query.problem, function(data) {
                if (data) {
                    // Problem exists, give it to the user
                    res.render('pages/problems/' + req.query.problem + '.ejs', { title: "Problems", ip: ip.address(), port: port });
                } else {
                    // Problem doesn't exist, give them the list of problems
                    res.render('pages/problems', { title: "Problems" });
                }
            });
        } else {
            // It wasn't, take user to the list of problems
            res.render('pages/problems', { title: "Problems" });
        }
    }

    // Check if a problem exists
    function problemExists(code, callback) {
        exists.exists('views/pages/problems/' + code + '.ejs', callback);
    }
}