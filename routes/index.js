express =  require('express');
Canvas = require('../models/canvas_state');
Bezier = require('../models/bezier');

const
  fs = require('fs'),
  path = require('path'),
  async = require('async'),
  forEach = require('async-foreach').forEach;

router = express.Router();

router.get('/', function(req, res){
  return res.render('bezier', {});
  //res.send('Hello World');
});


router.get('/watch', function(req, res){
  res.render('watch', {});
});

router.get('/canvas/index', function(req, res){
  Canvas.find({}, function(err, _states){
    if(err)
      console.error(err);
    res.send({list: _states});
  })
})
router.get('/bezier/load/:id', function(req, res){
  Canvas.findOne({id: req.params.id}, function(err, _state){
    if(err)
      console.error(err);
    _state.getCurves(function(curves){
      res.send({canvas_state: curves});
    })
  })
});
router.post('/bezier/save', function(req, res){
  if(req.body.canvas_state ==  null)
    return res.status(400).send({err: 'No curve data'});
  
  // serialize all curves to canvas_state
  var curves = []; 
  var _name = req.body.name;
  forEach(req.body.canvas_state, function(_item){
    var done = this.async();
    bezier = new Bezier();
    bezier.serialize(_item.curve, function(err, curve){
      if(err){
        console.log(err)
        return res.status(500).send(err);
      }
      console.log('bezier id: ' + curve.id);
      curves.push(curve.id);
      done();
    })
  }, function(){
    canvas = new Canvas();
    canvas.name = _name; 
    canvas.curves = curves;
    canvas.save(function(err){
      if(err)
        console.error(err);
      return res.send('ok');
    });
  })
});


module.exports = router