const Koa = require('koa');
const Router = require('koa-router');
const route = require('koa-route');
const path = require('path');
const bodyParser = require('koa-bodyparser');
const convert = require('koa-convert');
const views = require('koa-views');
const helmet = require('koa-helmet');
const session = require('koa-generic-session');
const passport = require('koa-passport');
const Sequelize = require('sequelize');
const randomstring = require('randomstring');

const app = new Koa();
const router = new Router();

app.proxy = true;


passport.serializeUser(function(user, done) {
  done(null, user.id)
});

passport.deserializeUser(function(id, done) {
  User.findOne({id :id}).then((user) => {
    done(null, user)
  });
});

const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({username: username}).then((user) => {
    if (user === null) {
      done(null, false, {message: 'invalid credentials'});
    }

    const hashed = 'huyzalupasir'+password;
    if (hashed === user.password_hash) {
      done(null, user);
    }
    else {
      done(null, false, {message: 'invalid credentials'});
    }
  });
}))

app.keys = ['secret', 'key'];
app
  .use(convert(views(path.join(__dirname,'/views'), { extension: 'jade' })))
  .use(bodyParser())
  .use(convert(require('koa-static')(__dirname + '/public')))
  .use(convert(helmet()))
  .use(convert(session(app)))
  .use(passport.initialize())
  .use(passport.session());


app.use(route.get('/', async (ctx) => {
  ctx.state = {
    title: 'koa2 title'
  };

  await ctx.render('login', {});
}));

app.use(route.get('/success', async (ctx) => {
  if (ctx.isAuthenticated()) {
    ctx.state = {
      title: 'koa2 success',
      success: true
    };  
  }
  else {
    ctx.state = {
      title: 'koa2 failure',
      success: false
    };
  }
  await ctx.render('success', {});
}));

app.use(route.get('/logout', async (ctx) => {
  await ctx.logout();
  await ctx.redirect('/');
}))
// POST /login
app.use(route.post('/login',
  passport.authenticate('local', {
    successRedirect: '/success',
    failureRedirect: '/failure'
  })
))
app.use(route.get('/failrure', (ctx) => {
  ctx.body = ctx.render({ // Use your render method
        error: 'Invalid credentials' ,
  });
}));
app.on('error', function(err, ctx){
  console.log(err)
  log.error('server error', err, ctx);
});



// Or you can simply use a connection uri
// without password and options
var sequelize = new Sequelize('postgres://yan@localhost:5432/crystal');
var User = sequelize.define('user', {
  username: {
    type: Sequelize.STRING
  },
  password_hash: Sequelize.STRING,
  password: {
    type: Sequelize.VIRTUAL,
    set: function (val) {
       this.salt = "huyzalupasir"; //I am extremely sorry for this but Win is piece of shit cannot handle with installing bcrypt
       this.setDataValue('password', val); // Remember to set the data value, otherwise it won't be validated
       this.setDataValue('password_hash', this.salt + val);
     },
    //  set: function(password, done) {
    //   return bcrypt.genSalt(10, function(err, salt) {
    //     return bcrypt.hash(password, salt, function(error, encrypted) {
    //       this.password = encrypted;
    //       this.salt = salt;
    //       return done();
    //     });
    //   }
    // },
     validate: {
        isLongEnough: function (val) {
          if (val.length < 7) {
            throw new Error("Please choose a longer password")
         }
      }
    }
  }
});

// force: true will drop the table if it already exists
User.sync({force: true}).then(function () {
  // Table created
  return User.create({
    username: 'John',
    password: '1234567'
  });
});
// start server
const port = process.env.PORT || 3000
app.listen(port, () => console.log('Server listening on', port))

