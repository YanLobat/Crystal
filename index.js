const Koa = require('koa');
const Router = require('koa-router');
const path = require('path');
const bodyParser = require('koa-bodyparser');
const convert = require('koa-convert');
const views = require('koa-views');
const helmet = require('koa-helmet');
const session = require('koa-generic-session');
const passport = require('koa-passport');
const co = require('co');

const app = new Koa();
const router = new Router();


const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy('local', (username, password, done) => {
	console.log('here');
	return co(function*(){
	    try {
	      if (username === 'test' && password === 'test') {
		    done(null, user)
		  } else {
		    done(null, false)
		  }
	    } catch (err) {
	      throw err;
	    }
  	});
}));


app
  .use(convert(views(path.join(__dirname,'/views'), { extension: 'jade' })))
  .use(convert(router.routes()))
  .use(convert(router.allowedMethods()))
  .use(convert(bodyParser))
  .use(convert(require('koa-static')(__dirname + '/public')))
  .use(convert(helmet()))
  .use(convert(session(app)))
  .use(convert(passport.initialize()))
  .use(convert(passport.session()))
  .use(async (ctx, next) => {
  	const start = new Date();
  	await next();
  	const ms = new Date() - start;
  	console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  });

router
  .get('/', async function (ctx, next) {
  	ctx.state = {
    	title: 'koa2 title'
  	};

  	await ctx.render('login', {
  	});
  })
 router
 .post('/login', passport.authenticate('local', {
    successRedirect: '/secretBankAccount',
    failureRedirect: '/damn'
   }));

app.on('error', function(err, ctx){
  console.log(err)
  log.error('server error', err, ctx);
});

app.listen(3000);

