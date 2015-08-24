#  配架図レイヤーを表示するOpenLayers3プラグイン
#
#  @author sakai@calil.jp
#  @author ryuuji@calil.jp
#
class Kanilayer extends ol.layer.Group
  tileA: null
  tileB: null
  vector: null

  # 配架図レイヤーを作成する
  #
  # @param options {Object} オプション
  # @option kFloor {Number} フロアID
  #
  constructor: (options) ->
    options_=
      minResolution: 0.0001
      maxResolution: 100
      kFloor: null
    merge = (obj1, obj2) ->
      if !obj2
        obj2 = {}
      for attr of obj2
        if obj2.hasOwnProperty(attr)
          obj1[attr] = obj2[attr]
    merge(options_,options)

    id = options_.kFloor
    xid = ("0000000000" + parseInt(id)).slice(-10)
    tileA = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: "https://tiles.haika.io/" + xid + "/{z}/{x}/{y}.png",
        maxZoom: 24,
      }),
      opacity: 1,
      preload: 3
    })
    options_.layers=[tileA]
    super(options_)

  # フロアを変更する
  #
  # @param newId {Number} フロアID
  #
  setFloorId: (newId,animation=True) ->
    return