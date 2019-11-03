
module.exports = (app) => {
   app.set('view engine','ejs');
   app.get('/games/:id', function(req, res) {
      try {
         sl = req.params.id.split(':');
         var gameName = sl[0];
         sl.splice(0, 1);
         res.render(__dirname + "/public/games", {gameName: gameName, gameParams: sl});
      }
      catch(error) {
         console.log('error : ' + error);
      }
   });
}

