const router = require('koa-router')();

router.get('/', async function (ctx, next) {
  console.log('hre');
  ctx.state = {
    title: 'koa2 title'
  };

  await ctx.render('login', {
  });
});

module.exports = router;