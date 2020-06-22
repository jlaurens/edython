describe('Metrics', function () {
  it ('POC: scaling divs', function () {
    var div0 = document.querySelector('#eyo-desk')
    var div1 = eYo.dom.createDom('div')
    eYo.dom.appendChild(div0.parentNode, div1)
    var style = div1.style
    var w  = 100
    var h = 100
    var s = 1.5
    style.width = `${w}px`
    style.height = `${h}px`
    style.background = 'blue'
    style.transform = `translate(${-w / 2}px, ${-h / 2}px) scale(${s}) translate(${w / 2}px, ${h / 2}px)`
  })
  it ('Metrics: Basic', function () {
    chai.assert(eYo.geom.Metrics)
    let onr = {}
    var mx = new eYo.geom.Metrics(onr)
    chai.assert(mx)
  })
  it ('place and scroll basics', function() {
    var div0 = document.querySelector('#eyo-desk')
    var metrics = new eYo.geom.Metrics()
    metrics.view_.size = eYo.geom.pPoint(parseInt(div0.style.width), parseInt(div0.style.height))
    var div1 = eYo.dom.createDom('div')
    eYo.dom.appendChild(div0.parentNode, div1)
    div1.style.position='relative'
    div1.style.width = `${metrics.view_.width}px`
    div1.style.height = `${metrics.view_.height}px`
    div1.style.overflow = 'hidden'
    var svg = eYo.svg.newElementSvg(div1, 'eyo-svg')
    svg.style.position='absolute'
    svg.setAttribute('preserveAspectRatio', 'xMinYMin slice')
    var content = metrics.port_
    content.origin = eYo.geom.tPoint(-8, -2)
    content.size = eYo.geom.tPoint(80, 20)
    svg.setAttribute('viewBox', `${content.x} ${content.y} ${content.width} ${content.height}`)
    metrics.scale_ = 1.1
    metrics.drag_ = eYo.geom.tPoint(4, 2)
    content = metrics.portInView
    svg.setAttribute('width', `${content.width}px`)
    svg.setAttribute('height', `${content.height}px`)
    svg.style.transform = `translate(${content.x}px,${content.y}px)`
    for (var i = -1 ; i < 11 ; i++) {
      eYo.svg.newElement('rect', {
        x: 8 * i * eYo.geom.X,
        y: 2 * i * eYo.geom.Y,
        width: 8 * eYo.geom.X,
        height: 2 * eYo.geom.Y,
        fill: 'yellow'
      },
      svg)
      eYo.svg.newElement('rect', {
        x: 8 * (i + 1) * eYo.geom.X,
        y: 2 * i * eYo.geom.Y,
        width: 8 * eYo.geom.X,
        height: 2 * eYo.geom.Y,
        fill: 'green'
      },
      svg)
      eYo.svg.newElement('rect', {
        x: 8 * i * eYo.geom.X,
        y: 2 * (i + 1) * eYo.geom.Y,
        width: 8 * eYo.geom.X,
        height: 2 * eYo.geom.Y,
        fill: 'red'
      },
      svg)
    }
    eYo.svg.newElement('circle',
      {cx: 20, cy: 13, r: 10, fill: 'red'},
      svg)
  })
  it ('SVG scaling', function() {

  })
  it ('place and scale basics', function() {
    var div0 = document.querySelector('#eyo-desk')
    var metrics = new eYo.geom.Metrics()
    metrics.view_.size = eYo.geom.pPoint(parseInt(div0.style.width), parseInt(div0.style.height))
    var div1 = eYo.dom.createDom('div')
    eYo.dom.appendChild(div0.parentNode, div1)
    div1.style.position='relative'
    div1.style.width = `${metrics.view_.width}px`
    div1.style.height = `${metrics.view_.height}px`
    div1.style.overflow = 'hidden'
    var svg = eYo.svg.newElementSvg(div1, 'eyo-svg')
    svg.style.position='absolute'
    svg.setAttribute('preserveAspectRatio', 'xMinYMin slice')
    var content = metrics.port_
    content.origin = eYo.geom.tPoint(-8, -2)
    content.size = eYo.geom.tPoint(80, 20)
    svg.setAttribute('viewBox', `${content.x} ${content.y} ${content.width} ${content.height}`)
    metrics.scale_ = 1.5
    metrics.drag_ = eYo.geom.tPoint(4, 2)
    content = metrics.portInView
    svg.setAttribute('width', `${content.width}px`)
    svg.setAttribute('height', `${content.height}px`)
    svg.style.transform = `translate(${content.x}px,${content.y}px)`
    for (var i = -1 ; i < 11 ; i++) {
      eYo.svg.newElement('rect', {
        x: 8 * i * eYo.geom.X,
        y: 2 * i * eYo.geom.Y,
        width: 8 * eYo.geom.X,
        height: 2 * eYo.geom.Y,
        fill: 'yellow'
      },
      svg)
      eYo.svg.newElement('rect', {
        x: 8 * (i + 1) * eYo.geom.X,
        y: 2 * i * eYo.geom.Y,
        width: 8 * eYo.geom.X,
        height: 2 * eYo.geom.Y,
        fill: 'green'
      },
      svg)
      eYo.svg.newElement('rect', {
        x: 8 * i * eYo.geom.X,
        y: 2 * (i + 1) * eYo.geom.Y,
        width: 8 * eYo.geom.X,
        height: 2 * eYo.geom.Y,
        fill: 'red'
      },
      svg)
    }
    eYo.svg.newElement('circle',
      {cx: 20, cy: 13, r: 10, fill: 'red'},
      svg)
  })
  it ('getBoundingClientRect truncated to 1/64th', function () {
    var div0 = document.querySelector('#eyo-desk')
    var div1 = eYo.dom.createDom('div')
    eYo.dom.appendChild(div0.parentNode, div1)
    div1.style.width = `${1/64}px`
    div1.style.height = `${1/64}px`
    var r = div1.getBoundingClientRect()
    console.error('getBoundingClientRect', 1/64, r.width)
    chai.expect(1/64).equal(r.width)
    div1.style.width = `${1/128}px`
    div1.style.height = `${1/128}px`
    var r = div1.getBoundingClientRect()
    chai.expect(0).equal(r.width)
  })
  it ('desk: metrics scaling', function () {
    var desk = new eYo.view.Desk({})
    chai.assert(desk !== eYo.app.desk)
    var board = desk.board
    var before = board.metrics
    board.metrics_.scale = 0.5
    var after = board.metrics
    chai.assert(before.view.equals(after.view))
  })  
})
