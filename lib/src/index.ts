import { fromEvent, animationFrameScheduler, interval, Observable, MonoTypeOperatorFunction } from 'rxjs'
import { distinctUntilChanged, filter, map, throttleTime, withLatestFrom } from 'rxjs/operators'

const { floor } = Math

function assert (x: unknown): asserts x {
  if (!(x as boolean)) {
    throw new Error('Assertion error')
  }
}

const canvas = document.getElementsByTagName('canvas')[0]
const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
assert(ctx)
ctx.imageSmoothingEnabled = false

interface Point {
  x: number
  y: number
}
const pointsEqual = (p0: Point, p1: Point): boolean =>
  p0.x === p1.x && p0.y === p1.y

const mouseEventToCanvasPoint = ({ clientX, clientY }: MouseEvent): Point => {
  const { left, top, width } = canvas.getBoundingClientRect()
  const x = clientX - left
  const y = clientY - top
  const scaleFactor = width / canvas.width
  return {
    x: x / scaleFactor,
    y: y / scaleFactor
  }
}

const frameDuration = 1 / 15

const mousePoint$: Observable<Point> = fromEvent(canvas, 'mousemove')
  .pipe(
    throttleTime(frameDuration),
    map(mouseEventToCanvasPoint)
  )
const mouseDown$: Observable<Point> = fromEvent(canvas, 'mousedown')
  .pipe(
    throttleTime(frameDuration),
    map(mouseEventToCanvasPoint)
  )

const cats = {
  horizontal: 3,
  vertical: 3
}
const portrait = {
  width: canvas.width / cats.horizontal,
  height: canvas.height / cats.vertical
}

const mapToQuadrant: MonoTypeOperatorFunction<Point> = (point$) =>
  point$.pipe(
    map(({ x, y }: Point): Point => {
      return {
        x: floor(x / portrait.width),
        y: floor(y / portrait.height)
      }
    }),
    distinctUntilChanged(pointsEqual)
  )

const mouseQuadrant$: Observable<Point> = mousePoint$.pipe(
  mapToQuadrant
)
// mouseQuadrant$.subscribe(console.log)

const mouseDownQuadrant$: Observable<Point> = mouseDown$.pipe(
  mapToQuadrant
)
// mouseDownQuadrant$.subscribe(console.warn)

const drawPoint = (
  point: Point,
  fillStyle: CanvasFillStrokeStyles['fillStyle'],
  size = 2
): void => {
  ctx.fillStyle = fillStyle
  const halfSize = size / 2
  ctx.fillRect(
    point.x - halfSize,
    point.y - halfSize,
    size,
    size
  )
}

const drawLine = (
  from: Point,
  to: Point,
  strokeStyle: CanvasFillStrokeStyles['strokeStyle'],
  lineWidth: CanvasPathDrawingStyles['lineWidth']
): void => {
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  {
    const { x, y } = from
    ctx.moveTo(floor(x), floor(y))
  }
  {
    const { x, y } = to
    ctx.lineTo(floor(x), floor(y))
  }
  ctx.stroke()
}

interval(frameDuration, animationFrameScheduler)
  .pipe(
    filter(() => !document.hidden),
    withLatestFrom(mousePoint$, mouseQuadrant$)
  )
  .subscribe(([_interval, canvasPoint, quadrant]: [number, Point, Point]) => {
    ctx.fillStyle = '#ccc'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    {
      const { x, y } = quadrant
      const { width, height } = portrait
      ctx.fillStyle = '#eee'
      ctx.fillRect(
        x * width,
        y * height,
        width,
        height
      )
    }
    for (let i = 1; i < cats.horizontal; i++) {
      drawLine(
        { x: i * portrait.width, y: 0 },
        { x: i * portrait.width, y: canvas.height },
        '#999',
        2
      )
    }
    for (let i = 1; i < cats.vertical; i++) {
      drawLine(
        { x: 0, y: i * portrait.height },
        { x: canvas.width, y: i * portrait.height },
        '#999',
        2
      )
    }
    drawPoint(canvasPoint, '#f00', 4)
  })