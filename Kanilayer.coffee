#  配架図レイヤーを表示するOpenLayers3プラグイン
#
#  @author sakai@calil.jp
#  @author ryuuji@calil.jp

class Kanilayer extends ol.layer.Group
  # @property [String] 現在のフロアID（読み込み専用）
  floorId: false

  # @nodoc 前面タイル (メインで使用する)
  tileA: null

  # @nodoc 背面タイル (切り替えの際に一時的に使用する)
  tileB: null

  # @nodoc ベクターレイヤー
  vector: null

  # @nodoc デバッグ表示の有無(内部ステート)
  debug_: false

  # @nodoc アニメーション用の内部ステート
  fadeAnimation: null

  # @property [String] 目的地メッセージ 'ここ!'
  targetMessage: 'ここ!'

  # @property [String] 目的地メッセージ '目的地'
  targetMessage2: '目的地'

  targetShelves: []
  # 強調表示する棚IDを指定
  setTargetShelf: (id)->
    @targetShelves = [{'id': id}]
    @vector.changed()

  setTargetShelves: (ids)->
    @targetShelves = ids
    @vector.changed()

  # 配架図のタイルソースオブジェクトを取得
  #　
  # @nodoc
  # @param id {String} フロアID
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
  # @param id {String} フロアID
  # @return {ol.source} ベクターソース
  getHaikaVectorSource_: (id)->
    return new ol.source.Vector(
      url: "https://app.haika.io/api/facility/2/#{id}.geojson"
      format: new ol.format.GeoJSON()
    )

  # 配架図レイヤーを作成する
  #
  # @param options {Object} オプション
  # @option kFloor {String} フロアID
  #
  constructor: (options) ->
    options_ =
      minResolution: 0.0001
      maxResolution: 100
      kFloor: null
      targetImageUrl: null
      targetImageUrl2: null
    merge = (obj1, obj2) ->
      if !obj2
        obj2 = {}
      for attr of obj2
        if obj2.hasOwnProperty(attr)
          obj1[attr] = obj2[attr]
    merge(options_, options)

    preThis = {}  # ES2015移行のためsuperの後ですべてthisへマージする

    if options_.targetImageUrl?
      preThis.targetImageUrl = options_.targetImageUrl
    if options_.targetImageUrl2?
      preThis.targetImageUrl2 = options_.targetImageUrl2

    preThis.tileA = new ol.layer.Tile({
      source: null
      opacity: 1
      preload: 3
    })

    preThis.tileB = new ol.layer.Tile({
      source: null
      opacity: 0
      visible: false
      preload: 3
    })

    styleFunction = (feature, resolution) =>
      styles = []
      if resolution < 1.0
        switch feature.get('type')
          when 'shelf'
            if resolution < 0.28
              text = feature.get('label') ? ''
            else
              text = ''

            index = -1 # 該当したレコードの順位
            index_ = 0
            side = null
            for shelf in @targetShelves
              if shelf.id == parseInt(feature.get('id'))
                if shelf.side?
                  if side is null
                    side = shelf.side
                  else
                    if side == 'a' and shelf.side == 'b'
                      side = null
                      break
                    if side == 'b' and shelf.side == 'a'
                      side = null
                      break
                index = index_
              index_++

            if index != -1
              @targetPosition = feature
              if index >= 1
                styles.push(new ol.style.Style(
                  stroke: new ol.style.Stroke(color: '#9E7E49', width: 2)
                  fill: new ol.style.Fill(color: '#FFBE4D')
                  geometry: (feature)->
                    a = feature.getGeometry().getCoordinates()[0][0]
                    b = feature.getGeometry().getCoordinates()[0][1]
                    c = feature.getGeometry().getCoordinates()[0][2]
                    d = feature.getGeometry().getCoordinates()[0][3]
                    size = (1 / resolution) * window.devicePixelRatio
                    if side == 'a' and size >= 20 * window.devicePixelRatio
                      c_ = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2]
                      d_ = [(a[0] + d[0]) / 2, (a[1] + d[1]) / 2]
                      return new ol.geom.Polygon([[a, b, c_, d_, a]])
                    else if side == 'b' and size >= 20 * window.devicePixelRatio
                      b_ = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2]
                      a_ = [(a[0] + d[0]) / 2, (a[1] + d[1]) / 2]
                      return new ol.geom.Polygon([[a_, b_, c, d, a_]])
                    else
                      return new ol.geom.Polygon([[a, b, c, d, a]])
                ))
              else
                styles.push(new ol.style.Style(
                  zIndex: 9998
                  stroke: new ol.style.Stroke(color: '#9E7E49', width: 2)
                  fill: new ol.style.Fill(color: '#FFBE4D')
                  geometry: (feature)->
                    a = feature.getGeometry().getCoordinates()[0][0]
                    b = feature.getGeometry().getCoordinates()[0][1]
                    c = feature.getGeometry().getCoordinates()[0][2]
                    d = feature.getGeometry().getCoordinates()[0][3]
                    size = (1 / resolution) * window.devicePixelRatio
                    console.log size
                    if side == 'a' and size >= 20 * window.devicePixelRatio
                      c_ = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2]
                      d_ = [(a[0] + d[0]) / 2, (a[1] + d[1]) / 2]
                      return new ol.geom.Polygon([[a, b, c_, d_, a]])
                    else if side == 'b' and size >= 20 * window.devicePixelRatio
                      b_ = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2]
                      a_ = [(a[0] + d[0]) / 2, (a[1] + d[1]) / 2]
                      return new ol.geom.Polygon([[a_, b_, c, d, a_]])
                    else
                      return new ol.geom.Polygon([[a, b, c, d, a]])
                ))

                size = (1 / resolution) * window.devicePixelRatio
                if size >= 1
                  if size > 20 * window.devicePixelRatio
                    url = @targetImageUrl
                    message = @targetMessage
                    size = Math.max(size, 45 * window.devicePixelRatio)
                  else
                    url = @targetImageUrl2
                    message = @targetMessage2
                    size = Math.max(size, 40 * window.devicePixelRatio)
                  console.log url, size
                  styles.push(new ol.style.Style(
                    text: new ol.style.Text(
                      textAlign: 'left'
                      textBaseline: 'hanging'
                      font: 'Arial bold'
                      text: message
                      fill: new ol.style.Fill(color: '#D95C02')
                      stroke: new ol.style.Stroke(color: [255, 255, 255, 1], width: 3)
                      scale: 2
                      offsetX: 25
                      offsetY: -40
                      rotation: 0)
                    image: new ol.style.Icon(
                      anchor: [0.5, 1]
                      scale: size / 233
                      anchorXUnits: 'fraction'
                      anchorYUnits: 'fraction'
                      opacity: 1
                      src: url)
                    geometry: (feature) ->
                      a = feature.getGeometry().getCoordinates()[0][0]
                      b = feature.getGeometry().getCoordinates()[0][1]
                      c = feature.getGeometry().getCoordinates()[0][2]
                      d = feature.getGeometry().getCoordinates()[0][3]
                      size = (1 / resolution) * window.devicePixelRatio
                      if side == 'a' and size >= 20* window.devicePixelRatio
                        diff_ad = [(d[0] - a[0]) / 2, (d[1] - a[1]) / 2]
                        ab = [(a[0] + b[0]) / 2 - diff_ad[0] * 2, (a[1] + b[1]) / 2 - diff_ad[1] * 2]
                        return new ol.geom.Point(ab)
                      else if side == 'b' and size >= 20* window.devicePixelRatio
                        diff_ad = [(d[0] - a[0]) / 2, (d[1] - a[1]) / 2]
                        cd = [(c[0] + d[0]) / 2 + diff_ad[0] * 1.5, (c[1] + d[1]) / 2 + diff_ad[1] * 1.5]
                        return new ol.geom.Point(cd)
                      else
                        abcd = [(a[0] + b[0] + c[0] + d[0]) / 4, (a[1] + b[1] + c[1] + d[1]) / 4]
                        return new ol.geom.Point(abcd)
                    zIndex: 9999
                  ))

            else
              styles.push(new ol.style.Style(
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
              ))
          when 'beacon'
            if @debug_ == true
              styles.push(new ol.style.Style(
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
                  text: feature.get('minor') + ' (' + feature.get('lane') + ')'
                  fill: new ol.style.Fill(color: [0, 0, 0, 1])
                  stroke: new ol.style.Stroke(color: [255, 255, 255, 1], width: 1.5)
                  scale: 1
                  offsetX: 8
                  offsetY: 0
                  rotation: 0)
              ))
      return styles

    preThis.vector = new ol.layer.Vector(
      source: null
      style: styleFunction
      opacity: 1
    )

    options_.layers = [preThis.tileB, preThis.tileA, preThis.vector]
    super(options_)
    @tileA = preThis.tileA
    @tileB = preThis.tileB
    @vector = preThis.vector

    @vector.on 'postcompose', @postcompose_, @
    @tileA.on 'precompose', @precompose_, @
    if options_.kFloor?
      @setFloorId(options_.kFloor, false)



  # フロアを変更する
  #
  # @param newId {String} フロアID
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

  # 目的地の画像URL
  targetImageUrl: null
  targetPosition: null