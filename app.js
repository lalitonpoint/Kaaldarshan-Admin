const express = require('express');
const path = require('path');
const md5 = require('md5');
const session = require('express-session');
const app = express();
app.use(express.static(path.join(__dirname, 'public'))); // ✅ This line is required
const db = require('./connection');
const authMiddleware = require('./middleware/authMiddleware');
const authenticateJWT = require('./api/middleware/authentication'); // 
const customHealper = require('./healpers/custom_healper');
const categoryRoutes = require('./routes/categoryRoutes'); // Import the route
const userRoutes = require('./routes/userRoutes'); // Import the route
const healerRoutes = require('./routes/healerRoutes'); // Import the route
const bannerRoutes = require('./routes/bannerRoutes'); // Import the route
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const blogRoutes = require('./routes/blogRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const aboutusRoutes = require('./routes/aboutRoutes');
const term_conditionRoutes = require('./routes/termRoutes');
const privacyRoutes = require('./routes/privacyRoutes');
const help_support = require('./routes/helpSupportRoutes');
const transacton_record = require('./routes/transactionRoutes');
// const billing = require('./routes/billingRoutes');
const apiRoutes = require('./api/routes/indexRoutes'); // Import the route
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
require('dotenv').config();
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Set up session middleware before custom middleware
app.use(session({ 
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,  // You can switch this to false once debugging is done
    cookie: { secure: false } // Set to true if you're using HTTPS
}));
app.use(express.json());


app.use('/api', (req, res, next) => { 
    if (req.path === '/signup/signup') {
      // Bypass JWT for /signup
      return next();
    }
     if (req.path === '/signup/login') {
      // Bypass JWT for /signup
      return next();
    }
    // Apply JWT middleware for all other routes
    authenticateJWT(req, res, next);
  });
  
  app.use('/api', apiRoutes); 


app.use(authMiddleware);  // Custom middleware after session
// Middleware for parsing application/json
// app.use(express.json());

// Middleware for parsing application/x-www-form-urlencoded (for form submissions)
app.use(express.urlencoded({ extended: true }));

app.use('/category', categoryRoutes);  // URL will be /category/add_category_ajax
app.use('/user',userRoutes);
app.use('/subscription',subscriptionRoutes);
app.use('/blog',blogRoutes);
app.use('/ticket',ticketRoutes);
app.use('/testimonial',testimonialRoutes);
app.use('/term_condition',term_conditionRoutes);
app.use('/privacy_policy',privacyRoutes);
app.use('/help_support', help_support);
app.use('/about',aboutusRoutes);
app.use('/transacton_record',transacton_record);
// app.use('/billing_details',billing);
app.use('/healer', healerRoutes);  // URL will be /category/add_category_ajax
app.use('/banner', bannerRoutes);  // URL will be /category/add_category_ajax



// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve login HTML page
app.get("/login", (req, res) => {
    res.render('login');
});

const User = require('./models/User'); // Adjust the path to your User model
// const router = express.Router();

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // Query the MySQL database for the user using Sequelize
        const user = await User.findOne({
            where: {
                email: email,
                password: md5(password), // Hash the password
            },
        });

        if (user) {
            // Set up session for the logged-in user
            req.session.user = {
                id: user.id,
                email: user.email,
            };

            // Save session
            req.session.save(err => {
                if (err) {
                    return res.status(500).json({ message: "Error saving session." });
                }
                return res.status(200).json({ message: "Login successful!" });
            });
        } else {
            return res.status(401).json({ message: "Invalid email or password." });
        }
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "An error occurred during login." });
    }
});


// Other routes (home, about)
// app.get('/about', (req, res) => {
//     res.send("Hello, this is the about page.");
// });

app.get('/home', (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "You need to log in first." });
    }
    res.render('template', {
        title: 'Home Page',
        body: 'dashboard',
        user: req.session.user
      });
});

app.get('/user', (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "You need to log in first." });
    }
    const body = 'user/add_user';
    //console.log(body); // This will log to the server console

    res.render('template', {
        title: 'User Page',
        body: body,
        user: req.session.user
    });
});

app.get('/category', (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "You need to log in first." });
    }
    const body = 'category/add_category';
    //console.log(body); // This will log to the server console

    res.render('template', {
        title: 'Category Page',
        body: body,
        user: req.session.user
    });
});

app.get('/healer', (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "You need to log in first." });
    }
    const body = 'healer/healers_list';
    //console.log(body); // This will log to the server console

    res.render('template', {
        title: 'Category Page',
        body: body,
        user: req.session.user
    });
});

app.get('/subscription', (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "You need to log in first." });
    }
    const body = 'subscription/subscription_managemant';
    //console.log(body); // This will log to the server console

    res.render('template', {
        title: 'subscription Page',
        body: body,
        user: req.session.user
    });
});

app.get('/blog', (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "You need to log in first." });
    }
    const body = 'blog/add_blog';
    //console.log(body); // This will log to the server console

    res.render('template', {
        title: 'Blogs Page',
        body: body,
        user: req.session.user
    });
});

app.get('/banner', (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "You need to log in first." });
    }
    const body = 'banner/banner_managemant';
    //console.log(body); // This will log to the server console

    res.render('template', {
        title: 'Category Page',
        body: body,
        user: req.session.user
    });
});

app.get('/ticket_management', (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "You need to log in first." });
    }
    const body = 'raise_ticket/ticket_management';
    //console.log(body); // This will log to the server console

    res.render('template', {
        title: 'Ticket Page',
        body: body,
        user: req.session.user
    });
});

app.get('/Testimonial_management', (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "You need to log in first." });
    }
    const body = 'testimonial/add_testimonial';
    //console.log(body); // This will log to the server console

    res.render('template', {
        title: 'Testimonial Page',
        body: body,
        user: req.session.user
    });
});

app.get('/about_us', (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "You need to log in first." });
    }
    const body = 'basic_info/about_us';
    //console.log(body); // This will log to the server console

    res.render('template', {
        title: 'About Page',
        body: body,
        user: req.session.user
    });
});

app.get('/term_condition', (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "You need to log in first." });
    }
    const body = 'basic_info/term_and_condition';
    //console.log(body); // This will log to the server console

    res.render('template', {
        title: 'Term Page',
        body: body,
        user: req.session.user
    });
});

app.get('/help_support', (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "You need to log in first." });
    }
    const body = 'basic_info/help_support';
    //console.log(body); // This will log to the server console

    res.render('template', {
        title: 'Term Page',
        body: body,
        user: req.session.user
    });
});

app.get('/privacy_policy', (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "You need to log in first." });
    }
    const body = 'basic_info/privacy_policy';
    //console.log(body); // This will log to the server console

    res.render('template', {
        title: 'Term Page',
        body: body,
        user: req.session.user
    });
});


app.get('/transaction_record', (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "You need to log in first." });
    }
    const body = 'transaction/transaction';
    //console.log(body); // This will log to the server console

    res.render('template', {
        title: 'Term Page',
        body: body,
        user: req.session.user
    });
});

app.get('/billing_details', (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "You need to log in first." });
    }
    const body = 'billing_details';
    //console.log(body); // This will log to the server console

    res.render('template', {
        title: 'Term Page',
        body: body,
        user: req.session.user
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "An error occurred during logout." });
        }
        res.redirect('/login'); // relative redirect

    });
});


// Start the server
app.listen(4500, () => {
    console.log("Server is running on port 4500");
});

app.use(express.static(path.join(__dirname, 'public')));
app.use("/css", express.static("node_modules/bootstrap/dist/css"));
app.use("/js", express.static("node_modules/bootstrap/dist/js"));

// Serve jQuery
app.use("/jquery", express.static("node_modules/jquery/dist"));


// Serve static files from the "node_modules" directory
app.use("/js", express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use("/js/ui", express.static(path.join(__dirname, 'node_modules/jquery-ui/dist')));
app.use("/css", express.static(path.join(__dirname, 'node_modules/jquery-ui/themes/base')));


app.use("/datatables/css", express.static(path.join(__dirname, "node_modules/datatables.net-dt/css")));
app.use("/datatables/js", express.static(path.join(__dirname, "node_modules/datatables.net/js")));

/////toaster

app.use('/toastr', express.static(path.join(__dirname, 'node_modules/toastr/build/')));