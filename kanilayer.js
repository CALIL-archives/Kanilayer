(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * 配架図レイヤーを表示するOpenLayers3プラグイン
 *
 *  @author sakai@calil.jp
 *  @author ryuuji@calil.jp
 */

var Kanilayer = function (_ol$layer$Group) {
  _inherits(Kanilayer, _ol$layer$Group);

  _createClass(Kanilayer, [{
    key: "setTargetShelf",


    /**
     * 強調表示する棚IDを指定
     * @param id
     * @returns {*|{min, max}}
     */
    value: function setTargetShelf(id) {
      this.targetShelves = [{
        "id": id
      }];

      return this.vector.changed();
    }

    /**
     * @nodoc
     * @param ids
     * @returns {*|{min, max}}
     */

  }, {
    key: "setTargetShelves",
    value: function setTargetShelves(ids) {
      this.targetShelves = ids;
      return this.vector.changed();
    }

    /**
     * 配架図のタイルソースオブジェクトを取得
     * @param id {String} フロアID
     * @returns {ol.source.XYZ} タイルソース
     * @private
     */

  }, {
    key: "getHaikaTileSource_",
    value: function getHaikaTileSource_(id) {
      var xid = ("0000000000" + parseInt(id)).slice(-10);

      return new ol.source.XYZ({
        url: "https://tiles.haika.io/" + xid + "/{z}/{x}/{y}.png",
        maxZoom: 24
      });
    }

    /**
     * @nodoc 配架図のベクターソースオブジェクトを取得
     * @param id {String} フロアID
     * @returns {ol.source.Vector} ベクターソース
     * @private
     */

  }, {
    key: "getHaikaVectorSource_",
    value: function getHaikaVectorSource_(id) {
      return new ol.source.Vector({
        url: "https://app.haika.io/api/facility/2/" + id + ".geojson",
        format: new ol.format.GeoJSON()
      });
    }

    /**
     * 配架図レイヤーを作成する
     * @param options {Object} オプション
     * @option kFloor {String} フロアID
     */

  }]);

  function Kanilayer(options) {
    _classCallCheck(this, Kanilayer);

    var options_ = {
      minResolution: 0.0001,
      maxResolution: 100,
      kFloor: null,
      targetImageUrl: null,
      targetImageUrl2: null
    };

    var merge = function merge(obj1, obj2) {
      if (!obj2) {
        obj2 = {};
      }

      return function () {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(obj2)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var attr = _step.value;

            if (obj2.hasOwnProperty(attr)) {
              obj1[attr] = obj2[attr];
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }();
    };

    merge(options_, options);
    var preThis = {};
    preThis.targetImageUrl = null;
    preThis.targetImageUrl2 = null;

    if (options_.targetImageUrl != null) {
      preThis.targetImageUrl = options_.targetImageUrl;
    }

    if (options_.targetImageUrl2 != null) {
      preThis.targetImageUrl2 = options_.targetImageUrl2;
    }

    preThis.tileA = new ol.layer.Tile({
      source: null,
      opacity: 1,
      preload: 3
    });

    preThis.tileB = new ol.layer.Tile({
      source: null,
      opacity: 0,
      visible: false,
      preload: 3
    });

    var styleFunction = function styleFunction(feature, resolution) {
      var message;
      var url;
      var size;
      var side;
      var index_;
      var index;
      var ref;
      var text;
      var styles = [];

      if (resolution < 1) {
        switch (feature.get("type")) {
          case "shelf":
            if (resolution < 0.28) {
              text = (ref = feature.get("label")) != null ? ref : "";
            } else {
              text = "";
            }

            index = -1;
            index_ = 0;
            side = null;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = _this.targetShelves[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var shelf = _step2.value;

                if (shelf.id === parseInt(feature.get("id"))) {
                  if (shelf.side != null) {
                    if (side === null) {
                      side = shelf.side;
                    } else {
                      if (side === "a" && shelf.side === "b") {
                        side = null;
                        break;
                      }

                      if (side === "b" && shelf.side === "a") {
                        side = null;
                        break;
                      }
                    }
                  }

                  index = index_;
                }

                index_++;
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }

            if (index !== -1) {
              _this.targetPosition = feature;

              if (index >= 1) {
                styles.push(new ol.style.Style({
                  stroke: new ol.style.Stroke({
                    color: "#9E7E49",
                    width: 2
                  }),

                  fill: new ol.style.Fill({
                    color: "#FFBE4D"
                  }),

                  geometry: function geometry(feature) {
                    var a_;
                    var b_;
                    var d_;
                    var c_;
                    var a = feature.getGeometry().getCoordinates()[0][0];
                    var b = feature.getGeometry().getCoordinates()[0][1];
                    var c = feature.getGeometry().getCoordinates()[0][2];
                    var d = feature.getGeometry().getCoordinates()[0][3];
                    var size = 1 / resolution * window.devicePixelRatio;

                    if (side === "a" && size >= 20 * window.devicePixelRatio) {
                      c_ = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
                      d_ = [(a[0] + d[0]) / 2, (a[1] + d[1]) / 2];
                      return new ol.geom.Polygon([[a, b, c_, d_, a]]);
                    } else if (side === "b" && size >= 20 * window.devicePixelRatio) {
                      b_ = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
                      a_ = [(a[0] + d[0]) / 2, (a[1] + d[1]) / 2];
                      return new ol.geom.Polygon([[a_, b_, c, d, a_]]);
                    } else {
                      return new ol.geom.Polygon([[a, b, c, d, a]]);
                    }
                  }
                }));
              } else {
                styles.push(new ol.style.Style({
                  zIndex: 9998,

                  stroke: new ol.style.Stroke({
                    color: "#9E7E49",
                    width: 2
                  }),

                  fill: new ol.style.Fill({
                    color: "#FFBE4D"
                  }),

                  geometry: function geometry(feature) {
                    var a_;
                    var b_;
                    var d_;
                    var c_;
                    var a = feature.getGeometry().getCoordinates()[0][0];
                    var b = feature.getGeometry().getCoordinates()[0][1];
                    var c = feature.getGeometry().getCoordinates()[0][2];
                    var d = feature.getGeometry().getCoordinates()[0][3];
                    var size = 1 / resolution * window.devicePixelRatio;
                    console.log(size);

                    if (side === "a" && size >= 20 * window.devicePixelRatio) {
                      c_ = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
                      d_ = [(a[0] + d[0]) / 2, (a[1] + d[1]) / 2];
                      return new ol.geom.Polygon([[a, b, c_, d_, a]]);
                    } else if (side === "b" && size >= 20 * window.devicePixelRatio) {
                      b_ = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
                      a_ = [(a[0] + d[0]) / 2, (a[1] + d[1]) / 2];
                      return new ol.geom.Polygon([[a_, b_, c, d, a_]]);
                    } else {
                      return new ol.geom.Polygon([[a, b, c, d, a]]);
                    }
                  }
                }));

                size = 1 / resolution * window.devicePixelRatio;

                if (size >= 1) {
                  if (size > 20 * window.devicePixelRatio) {
                    url = _this.targetImageUrl;
                    message = _this.targetMessage;
                    size = Math.max(size, 45 * window.devicePixelRatio);
                  } else {
                    url = _this.targetImageUrl2;
                    message = _this.targetMessage2;
                    size = Math.max(size, 40 * window.devicePixelRatio);
                  }

                  console.log(url, size);

                  styles.push(new ol.style.Style({
                    text: new ol.style.Text({
                      textAlign: "left",
                      textBaseline: "hanging",
                      font: "Arial bold",
                      text: message,

                      fill: new ol.style.Fill({
                        color: "#D95C02"
                      }),

                      stroke: new ol.style.Stroke({
                        color: [255, 255, 255, 1],
                        width: 3
                      }),

                      scale: 2,
                      offsetX: 25,
                      offsetY: -40,
                      rotation: 0
                    }),

                    image: new ol.style.Icon({
                      anchor: [0.5, 1],
                      scale: size / 233,
                      anchorXUnits: "fraction",
                      anchorYUnits: "fraction",
                      opacity: 1,
                      src: url
                    }),

                    geometry: function geometry(feature) {
                      var abcd;
                      var cd;
                      var ab;
                      var diff_ad;
                      var a = feature.getGeometry().getCoordinates()[0][0];
                      var b = feature.getGeometry().getCoordinates()[0][1];
                      var c = feature.getGeometry().getCoordinates()[0][2];
                      var d = feature.getGeometry().getCoordinates()[0][3];
                      size = 1 / resolution * window.devicePixelRatio;

                      if (side === "a" && size >= 20 * window.devicePixelRatio) {
                        diff_ad = [(d[0] - a[0]) / 2, (d[1] - a[1]) / 2];
                        ab = [(a[0] + b[0]) / 2 - diff_ad[0] * 2, (a[1] + b[1]) / 2 - diff_ad[1] * 2];
                        return new ol.geom.Point(ab);
                      } else if (side === "b" && size >= 20 * window.devicePixelRatio) {
                        diff_ad = [(d[0] - a[0]) / 2, (d[1] - a[1]) / 2];
                        cd = [(c[0] + d[0]) / 2 + diff_ad[0] * 1.5, (c[1] + d[1]) / 2 + diff_ad[1] * 1.5];
                        return new ol.geom.Point(cd);
                      } else {
                        abcd = [(a[0] + b[0] + c[0] + d[0]) / 4, (a[1] + b[1] + c[1] + d[1]) / 4];
                        return new ol.geom.Point(abcd);
                      }
                    },

                    zIndex: 9999
                  }));
                }
              }
            } else {
              styles.push(new ol.style.Style({
                text: new ol.style.Text({
                  textAlign: "center",
                  textBaseline: "hanging",
                  font: "Arial",
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
              }));
            }

            break;
          case "beacon":
            if (_this.debug_ === true) {
              styles.push(new ol.style.Style({
                image: new ol.style.Circle({
                  radius: 5,
                  fill: null,

                  stroke: new ol.style.Stroke({
                    color: "#000000"
                  })
                }),

                text: new ol.style.Text({
                  textAlign: "left",
                  textBaseline: "middle",
                  font: "Arial 12px",
                  text: feature.get("minor") + " (" + feature.get("lane") + ")",

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
              }));
            }
        }
      }

      return styles;
    };

    preThis.vector = new ol.layer.Vector({
      source: null,
      style: styleFunction,
      opacity: 1
    });

    options_.layers = [preThis.tileB, preThis.tileA, preThis.vector];

    var _this = _possibleConstructorReturn(this, (Kanilayer.__proto__ || Object.getPrototypeOf(Kanilayer)).call(this, options_));

    _this.tileA = preThis.tileA; // @nodoc 前面タイル (メインで使用する)
    _this.tileB = preThis.tileB; // @nodoc 背面タイル (切り替えの際に一時的に使用する)
    _this.vector = preThis.vector; // @nodoc ベクターレイヤー
    _this.floorId = false; // @property [String] 現在のフロアID（読み込み専用）
    _this.debug_ = false; // @nodoc デバッグ表示の有無(内部ステート)
    _this.fadeAnimation = null; // @nodoc アニメーション用の内部ステート
    _this.targetMessage = "ここ!"; // @property [String] 目的地メッセージ 'ここ!'
    _this.targetMessage2 = "目的地"; // @property [String] 目的地メッセージ '目的地'
    _this.targetShelves = [];
    _this.targetPosition = null;
    _this.targetImageUrl = preThis.targetImageUrl;
    _this.targetImageUrl2 = preThis.targetImageUrl2;
    _this.vector.on("postcompose", _this.postcompose_, _this);
    _this.tileA.on("precompose", _this.precompose_, _this);

    if (options_.kFloor != null) {
      _this.setFloorId(options_.kFloor, false);
    }
    return _this;
  }

  /**
   * フロアを変更する
   * @param newId {String} フロアID
   * @param animation
   * @returns {*|{min, max}}
   */


  _createClass(Kanilayer, [{
    key: "setFloorId",
    value: function setFloorId(newId) {
      var _this2 = this;

      var animation = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      var newSource;

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

        if (typeof newId !== "undefined" && newId !== null) {
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

          if (!(typeof newId !== "undefined" && newId !== null)) {
            this.fadeAnimation.phase = 2;
          } else {
            newSource.on("tileloadstart", function () {
              if (_this2.fadeAnimation != null) {
                return _this2.fadeAnimation.tilesStarted++;
              }
            });

            newSource.on("tileloadend", function () {
              if (_this2.fadeAnimation != null) {
                return _this2.fadeAnimation.tilesLoaded++;
              }
            });

            newSource.on("tileloaderror", function () {
              if (_this2.fadeAnimation != null) {
                return _this2.fadeAnimation.tilesLoaded++;
              }
            });
          }
        }

        return this.changed();
      }
    }

    /**
     * デバッグ表示の有無を設定する
     * @param newValue {Boolean} する:true, しない: false
     * @returns {*|{min, max}}
     */

  }, {
    key: "showDebugInfomation",
    value: function showDebugInfomation(newValue) {
      this.debug_ = newValue;
      return this.changed();
    }

    /**
     * @nodoc マップ描画処理
     * @private
     */

  }, {
    key: "precompose_",
    value: function precompose_(event) {
      var time;
      var frameState = event.frameState;

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
    }

    /**
     * @nodoc マップ描画処理
     * @private
     */

  }, {
    key: "postcompose_",
    value: function postcompose_(event) {
      var debugText;
      var context;

      if (this.debug_) {
        context = event.context;
        debugText = "[Kanilayer]";

        if (this.fadeAnimation) {
          debugText += " アニメーション中 フェーズ:";
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
    }
  }]);

  return Kanilayer;
}(ol.layer.Group);

// Deprecated
// ひとまずこれまで通りグローバルで使えるようにしておく


if (window) {
  window.Kanilayer = Kanilayer;
}

},{}]},{},[1]);
