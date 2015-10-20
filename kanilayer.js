var Kanilayer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Kanilayer = (function(superClass) {
  extend(Kanilayer, superClass);

  Kanilayer.prototype.floorId = false;

  Kanilayer.prototype.tileA = null;

  Kanilayer.prototype.tileB = null;

  Kanilayer.prototype.vector = null;

  Kanilayer.prototype.debug_ = false;

  Kanilayer.prototype.fadeAnimation = null;

  Kanilayer.prototype.targetShelf = null;

  Kanilayer.prototype.setTargetShelf = function(id) {
    this.targetShelf = id;
    return this.vector.changed();
  };

  Kanilayer.prototype.getHaikaTileSource_ = function(id) {
    var xid;
    xid = ("0000000000" + parseInt(id)).slice(-10);
    return new ol.source.XYZ({
      url: "https://tiles.haika.io/" + xid + "/{z}/{x}/{y}.png",
      maxZoom: 24
    });
  };

  Kanilayer.prototype.getHaikaVectorSource_ = function(id) {
    return new ol.source.Vector({
      url: "https://app.haika.io/api/facility/2/" + id + ".geojson",
      format: new ol.format.GeoJSON()
    });
  };

  function Kanilayer(options) {
    var merge, options_, styleFunction;
    options_ = {
      minResolution: 0.0001,
      maxResolution: 100,
      kFloor: null
    };
    merge = function(obj1, obj2) {
      var attr, results;
      if (!obj2) {
        obj2 = {};
      }
      results = [];
      for (attr in obj2) {
        if (obj2.hasOwnProperty(attr)) {
          results.push(obj1[attr] = obj2[attr]);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    merge(options_, options);
    this.tileA = new ol.layer.Tile({
      source: null,
      opacity: 1,
      preload: 3
    });
    this.tileB = new ol.layer.Tile({
      source: null,
      opacity: 0,
      visible: false,
      preload: 3
    });
    styleFunction = (function(_this) {
      return function(feature, resolution) {
        var ref, styleOptions, text;
        if (resolution < 1.0) {
          switch (feature.get('type')) {
            case 'shelf':
              if (resolution < 0.28) {
                text = (ref = feature.get('label')) != null ? ref : '';
              } else {
                text = '';
              }
              if (parseInt(_this.targetShelf) === parseInt(feature.get('id'))) {
                styleOptions = {
                  stroke: new ol.style.Stroke({
                    color: '#9E7E49',
                    width: 2
                  }),
                  fill: new ol.style.Fill({
                    color: '#FFBE4D'
                  }),
                  text: new ol.style.Text({
                    textAlign: 'center',
                    textBaseline: 'hanging',
                    font: 'Arial bold',
                    text: "（目的地）",
                    fill: new ol.style.Fill({
                      color: '#D95C02'
                    }),
                    stroke: new ol.style.Stroke({
                      color: [255, 255, 255, 1],
                      width: 3
                    }),
                    scale: 2,
                    offsetX: 0,
                    offsetY: 0,
                    rotation: 0
                  }),
                  zIndex: 9999
                };
              } else {
                styleOptions = {
                  text: new ol.style.Text({
                    textAlign: 'center',
                    textBaseline: 'hanging',
                    font: 'Arial',
                    text: text,
                    fill: new ol.style.Fill({
                      color: [0, 0, 0, 1]
                    }),
                    stroke: new ol.style.Stroke({
                      color: [255, 255, 255, 1],
                      width: 1.5
                    }),
                    scale: 1.5,
                    offsetX: 0,
                    offsetY: 0,
                    rotation: 0
                  })
                };
              }
              break;
            case 'beacon':
              if (_this.debug_ === true) {
                styleOptions = {
                  image: new ol.style.Circle({
                    radius: 5,
                    fill: null,
                    stroke: new ol.style.Stroke({
                      color: '#000000'
                    })
                  }),
                  text: new ol.style.Text({
                    textAlign: 'left',
                    textBaseline: 'middle',
                    font: 'Arial 12px',
                    text: feature.get('minor') + ' (' + feature.get('lane') + ')',
                    fill: new ol.style.Fill({
                      color: [0, 0, 0, 1]
                    }),
                    stroke: new ol.style.Stroke({
                      color: [255, 255, 255, 1],
                      width: 1.5
                    }),
                    scale: 1,
                    offsetX: 8,
                    offsetY: 0,
                    rotation: 0
                  })
                };
              } else {
                styleOptions = {};
              }
              break;
            default:
              styleOptions = {};
          }
          return [new ol.style.Style(styleOptions)];
        } else {
          return [new ol.style.Style()];
        }
      };
    })(this);
    this.vector = new ol.layer.Vector({
      source: null,
      style: styleFunction,
      opacity: 1
    });
    options_.layers = [this.tileB, this.tileA, this.vector];
    Kanilayer.__super__.constructor.call(this, options_);
    this.tileA.on('postcompose', this.postcompose_, this);
    this.tileA.on('precompose', this.precompose_, this);
    if (options_.kFloor != null) {
      this.setFloorId(options_.kFloor, false);
    }
  }

  Kanilayer.prototype.setFloorId = function(newId, animation) {
    var newSource;
    if (animation == null) {
      animation = true;
    }
    if (this.floorId !== newId) {
      this.floorId = newId;
      if (animation) {
        this.tileB.setSource(this.tileA.getSource());
        this.tileB.setOpacity(1);
        this.tileB.setVisible(true);
        this.tileA.setOpacity(0);
        this.vector.setOpacity(0);
      } else {
        this.tileA.setOpacity(1);
        this.tileB.setVisible(false);
        this.tileB.setSource(null);
        this.vector.setOpacity(1);
      }
      if (newId != null) {
        newSource = this.getHaikaTileSource_(newId);
        this.tileA.setSource(newSource);
        this.vector.setSource(this.getHaikaVectorSource_(newId));
      } else {
        newSource = this.getHaikaTileSource_(0);
        this.tileA.setSource(newSource);
        this.vector.setSource(null);
      }
      if (animation) {
        this.fadeAnimation = {
          start: new Date(),
          phase: 0,
          tilesStarted: 0,
          tilesLoaded: 0
        };
        if (newId == null) {
          this.fadeAnimation.phase = 2;
        } else {
          newSource.on('tileloadstart', (function(_this) {
            return function() {
              if (_this.fadeAnimation != null) {
                return _this.fadeAnimation.tilesStarted++;
              }
            };
          })(this));
          newSource.on('tileloadend', (function(_this) {
            return function() {
              if (_this.fadeAnimation != null) {
                return _this.fadeAnimation.tilesLoaded++;
              }
            };
          })(this));
          newSource.on('tileloaderror', (function(_this) {
            return function() {
              if (_this.fadeAnimation != null) {
                return _this.fadeAnimation.tilesLoaded++;
              }
            };
          })(this));
        }
      }
      return this.changed();
    }
  };

  Kanilayer.prototype.showDebugInfomation = function(newValue) {
    this.debug_ = newValue;
    return this.changed();
  };

  Kanilayer.prototype.precompose_ = function(event) {
    var frameState, time;
    frameState = event.frameState;
    if (this.fadeAnimation != null) {
      frameState.animate = true;
      if (this.fadeAnimation.phase === 0) {
        if (frameState.time - this.fadeAnimation.start > 2000) {
          this.fadeAnimation.phase = 1;
          return this.fadeAnimation.start = new Date();
        } else if (this.fadeAnimation.tilesStarted > 0 && this.fadeAnimation.tilesLoaded > 0) {
          this.fadeAnimation.phase = 1;
          if (frameState.time - this.fadeAnimation.start > 50) {
            return this.fadeAnimation.start = new Date();
          }
        }
      } else if (this.fadeAnimation.phase === 1) {
        time = (frameState.time - this.fadeAnimation.start) / 200;
        if (time <= 1) {
          return this.tileA.setOpacity(time);
        } else {
          this.tileA.setOpacity(1);
          this.fadeAnimation.phase = 2;
          return this.fadeAnimation.start = new Date();
        }
      } else if (this.fadeAnimation.phase === 2) {
        time = (frameState.time - this.fadeAnimation.start) / 150;
        if (time <= 1) {
          this.tileB.setOpacity(1 - time);
          return this.vector.setOpacity(time);
        } else {
          this.vector.setOpacity(1);
          this.tileB.setVisible(false);
          this.tileB.setSource(null);
          return this.fadeAnimation = null;
        }
      }
    }
  };

  Kanilayer.prototype.postcompose_ = function(event) {
    var context, debugText;
    if (this.debug_) {
      context = event.context;
      debugText = "[Kanilayer]";
      if (this.fadeAnimation) {
        debugText += ' アニメーション中 フェーズ:';
        debugText += this.fadeAnimation.phase;
      }
      context.save();
      context.fillStyle = "rgba(255, 255, 255, 0.6)";
      context.fillRect(0, context.canvas.height - 20, context.canvas.width, 20);
      context.font = "10px";
      context.fillStyle = "black";
      context.fillText(debugText, 10, context.canvas.height - 7);
      return context.restore();
    }
  };

  Kanilayer.prototype.targetImageUrl = null;

  return Kanilayer;

})(ol.layer.Group);
