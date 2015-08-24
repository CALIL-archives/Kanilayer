#  配架図レイヤーを表示するOpenLayers3プラグイン
#
#  @author sakai@calil.jp
#  @author ryuuji@calil.jp
#
class Kanilayer extends ol.layer.Group
  tileA: null
  tileB: null
  vector: null


  # @property [Number] フロアID（読み込み専用）
  floorId: false

  # @nodoc デバッグ表示の有無(内部ステート)
  debug_: false

  # 配架図のタイルソースオブジェクトを取得
  #　
  # @nodoc
  # @param id {Number} フロアID
  # @return ol.source
  getHaikaTileSource_: (id)->
    xid = ("0000000000" + parseInt(id)).slice(-10)
    return new ol.source.XYZ({
      url: "https://tiles.haika.io/" + xid + "/{z}/{x}/{y}.png",
      maxZoom: 24,
    })

  # 配架図レイヤーを作成する
  #
  # @param options {Object} オプション
  # @option kFloor {Number} フロアID
  #
  constructor: (options) ->
    options_ =
      minResolution: 0.0001
      maxResolution: 100
      kFloor: null
    merge = (obj1, obj2) ->
      if !obj2
        obj2 = {}
      for attr of obj2
        if obj2.hasOwnProperty(attr)
          obj1[attr] = obj2[attr]
    merge(options_, options)

    @tileA = new ol.layer.Tile({
      source: @getHaikaTileSource_(options_.kFloor)
      opacity: 1
      preload: 3
    })
    options_.layers = [@tileA]
    super(options_)
    @tileA.on('postcompose', @postcompose_, this)

  # フロアを変更する
  #
  # @param newId {Number} フロアID
  #
  setFloorId: (newId, animation = true) ->
    @tileA.setSource(@getHaikaTileSource_(newId))
    @changed()

  # デバッグ表示の有無を設定する
  #
  # @param newValue {Boolean} する:true, しない: false
  #
  showDebugInfomation: (newValue)->
    @debug_ = newValue
    @changed()

  # @nodoc マップ描画処理
  postcompose_: (event)->
    if @debug_
      context = event.context
      debugText = "[Kanilayer]"
      context.save()
      context.fillStyle = "rgba(255, 255, 255, 0.6)"
      context.fillRect(0, context.canvas.height - 20, context.canvas.width, 20)
      context.font = "10px"
      context.fillStyle = "black"
      context.fillText(debugText, 10, context.canvas.height - 7)
      context.restore()