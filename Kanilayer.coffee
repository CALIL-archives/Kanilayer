#  配架図レイヤーを表示するOpenLayers3プラグイン
#
#  @author sakai@calil.jp
#  @author ryuuji@calil.jp

class Kanilayer extends ol.layer.Group
  # @property [Number] 現在のフロアID（読み込み専用）
  floorId: false

  # @nodoc 前面タイル (メインで使用する)
  tileA: null

  # @nodoc 背面タイル (切り替えの際に一時的に使用する)
  tileB: null

  # @nodec ベクターレイヤー
  vector: null

  # @nodoc デバッグ表示の有無(内部ステート)
  debug_: false

  # @nodoc アニメーション用の内部ステート
  fadeAnimation: null

  targetShelf: null

  # 強調表示する棚IDを指定
  setTargetShelf: (id)->
    @targetShelf = id
    @vector.changed()

  # 配架図のタイルソースオブジェクトを取得
  #　
  # @nodoc
  # @param id {Number} フロアID
  # @return {ol.source} タイルソース
  getHaikaTileSource_: (id)->
    xid = ("0000000000" + parseInt(id)).slice(-10)
    return new ol.source.XYZ({
      url: "https://tiles.haika.io/" + xid + "/{z}/{x}/{y}.png",
      maxZoom: 24,
    })

  # 配架図のベクターソースオブジェクトを取得
  #　
  # @nodoc
  # @param id {Number} フロアID
  # @return {ol.source} ベクターソース
  getHaikaVectorSource_: (id)->
    return new ol.source.Vector(
      url: "https://app.haika.io/api/facility/2/#{id}.geojson"
      format: new ol.format.GeoJSON()
    )

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
      source: null
      opacity: 1
      preload: 3
    })

    @tileB = new ol.layer.Tile({
      source: null
      opacity: 0
      visible: false
      preload: 3
    })

    styleFunction = (feature, resolution) =>
      if resolution < 1.0
        switch feature.get('type')
          when 'shelf'
            if resolution < 0.28
              text = feature.get('label') ? ''
            else
              text = ''
            if parseInt(@targetShelf)==parseInt(feature.get('id'))
              styleOptions =
                stroke: new ol.style.Stroke(color: '#9E7E49', width: 2)
                fill:new ol.style.Fill(color: '#FFBE4D')
                text: new ol.style.Text(
                  textAlign: 'center'
                  textBaseline: 'hanging'
                  font: 'Arial bold'
                  text: "（目的地）"
                  fill: new ol.style.Fill(color: '#D95C02')
                  stroke: new ol.style.Stroke(color: [255, 255, 255, 1], width: 3)
                  scale: 2
                  offsetX: 0
                  offsetY: 0
                  zIndex: 9999
                  rotation: 0)
            else
              styleOptions =
                #stroke: new ol.style.Stroke(color: 'blue', width: 1)
                text: new ol.style.Text(
                  textAlign: 'center'
                  textBaseline: 'hanging'
                  font: 'Arial'
                  text: text
                  fill: new ol.style.Fill(color: [0, 0, 0, 1])
                  stroke: new ol.style.Stroke(color: [255, 255, 255, 1], width: 1.5)
                  scale: 1.5
                  offsetX: 0
                  offsetY: 0
                  rotation: 0)
          when 'beacon'
            if @debug_==true
              styleOptions =
                image: new ol.style.Circle({
                  radius: 5,
                  fill: null,
                  stroke: new ol.style.Stroke({
                    color: '#000000'
                  })
                })
                text: new ol.style.Text(
                  textAlign: 'left'
                  textBaseline: 'middle'
                  font: 'Arial 12px'
                  text:  feature.get('minor')+ ' ('+feature.get('lane')+')'
                  fill: new ol.style.Fill(color: [0, 0, 0, 1])
                  stroke: new ol.style.Stroke(color: [255, 255, 255, 1], width: 1.5)
                  scale: 1
                  offsetX: 8
                  offsetY: 0
                  rotation: 0)
            else
              styleOptions = {}
          else
            styleOptions = {}
        return [new ol.style.Style(styleOptions)]
      else
        return [new ol.style.Style()]

    @vector = new ol.layer.Vector(
      source: null
      style: styleFunction
      opacity: 1
    )

    options_.layers = [@tileB, @tileA, @vector]
    super(options_)
    @tileA.on 'postcompose', @postcompose_, @
    @tileA.on 'precompose', @precompose_, @
    if options_.kFloor?
      @setFloorId(options_.kFloor, false)



  # フロアを変更する
  #
  # @param newId {Number} フロアID
  #
  setFloorId: (newId, animation = true) ->
    if @floorId != newId
      @floorId = newId

      # 現在表示されているレイヤーを背面に移動
      if animation
        @tileB.setSource(@tileA.getSource())
        @tileB.setOpacity(1)
        @tileB.setVisible(true)
        @tileA.setOpacity(0)
        @vector.setOpacity(0)
      else
        @tileA.setOpacity(1)
        @tileB.setVisible(false)
        @tileB.setSource(null)
        @vector.setOpacity(1)

      if newId?
        newSource = @getHaikaTileSource_(newId)
        @tileA.setSource(newSource)
        @vector.setSource(@getHaikaVectorSource_(newId))
      else
        newSource = @getHaikaTileSource_(0)
        @tileA.setSource(newSource)
        @vector.setSource(null)

      # アニメーションを開始
      if animation
        @fadeAnimation =
          start: new Date()
          phase: 0
          tilesStarted: 0
          tilesLoaded: 0
        # 非表示に切り替える場合はフェーズ2から
        if not newId?
          @fadeAnimation.phase = 2
        else
          # ある程度タイルがロードされてからフェードインするため
          # タイルの要求数とロード済み数を集計する
          newSource.on 'tileloadstart', =>
            if @fadeAnimation?
              @fadeAnimation.tilesStarted++
          newSource.on 'tileloadend', =>
            if @fadeAnimation?
              @fadeAnimation.tilesLoaded++
          newSource.on 'tileloaderror', =>
            if @fadeAnimation?
              @fadeAnimation.tilesLoaded++

      @changed()

  # デバッグ表示の有無を設定する
  #
  # @param newValue {Boolean} する:true, しない: false
  #
  showDebugInfomation: (newValue)->
    @debug_ = newValue
    @changed()

  # @nodoc マップ描画処理
  precompose_: (event)->
    frameState = event.frameState
    # アニメーション処理
    # phase=0 タイル画像のロードを待つ(最大2000ms)
    # phase=1 新しい配架図をフェードイン(200ms)
    # phase=2 古い配架図をフェードアウト(150ms)
    if @fadeAnimation?
      frameState.animate = true
      if @fadeAnimation.phase == 0
        if frameState.time - @fadeAnimation.start > 2000
          @fadeAnimation.phase = 1
          @fadeAnimation.start = new Date()
        else if @fadeAnimation.tilesStarted > 0 and @fadeAnimation.tilesLoaded > 0
          @fadeAnimation.phase = 1
          if frameState.time - @fadeAnimation.start > 50
            @fadeAnimation.start = new Date()
      else if @fadeAnimation.phase == 1
        time = (frameState.time - @fadeAnimation.start) / 200
        if time <= 1
          @tileA.setOpacity(time)
        else
          @tileA.setOpacity(1)
          @fadeAnimation.phase = 2
          @fadeAnimation.start = new Date()
      else if @fadeAnimation.phase == 2
        time = (frameState.time - @fadeAnimation.start) / 150
        if time <= 1
          @tileB.setOpacity(1 - time)
          @vector.setOpacity(time)
        else
          @vector.setOpacity(1)
          @tileB.setVisible(false)
          @tileB.setSource(null)
          @fadeAnimation = null

  # @nodoc マップ描画処理
  postcompose_: (event)->
    if @debug_
      context = event.context
      debugText = "[Kanilayer]"
      if @fadeAnimation
        debugText += ' アニメーション中 フェーズ:'
        debugText += @fadeAnimation.phase
      context.save()
      context.fillStyle = "rgba(255, 255, 255, 0.6)"
      context.fillRect(0, context.canvas.height - 20, context.canvas.width, 20)
      context.font = "10px"
      context.fillStyle = "black"
      context.fillText(debugText, 10, context.canvas.height - 7)
      context.restore()