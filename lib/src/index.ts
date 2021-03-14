import { fromEvent, animationFrameScheduler, interval, Observable, MonoTypeOperatorFunction } from 'rxjs'
import { distinctUntilChanged, filter, map, withLatestFrom } from 'rxjs/operators'

function assert (x: unknown): asserts x {
  if (!(x as boolean)) {
    throw new Error('Assertion error')
  }
}

const canvas = document.getElementsByTagName('canvas')[0]
const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
assert(ctx)

interface Point {
  x: number
  y: number
}
const pointsEqual = (p0: Point, p1: Point): boolean =>
  p0.x === p1.x && p0.y === p1.y

const mouseEventToCanvasPoint = ({ clientX, clientY }: MouseEvent): Point => {
  const { left, top } = canvas.getBoundingClientRect()
  const x = clientX - left
  const y = clientY - top
  return { x, y }
}

const mousePoint$: Observable<Point> = fromEvent(canvas, 'mousemove')
  .pipe(
    map(mouseEventToCanvasPoint)
  )
const mouseDown$: Observable<Point> = fromEvent(canvas, 'mousedown')
  .pipe(
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
        x: Math.floor(x / portrait.width),
        y: Math.floor(y / portrait.height)
      }
    }),
    distinctUntilChanged(pointsEqual)
  )

const mouseQuadrant$: Observable<Point> = mousePoint$.pipe(
  mapToQuadrant
)
mouseQuadrant$.subscribe(console.log)

const mouseDownQuadrant$: Observable<Point> = mouseDown$.pipe(
  mapToQuadrant
)
mouseDownQuadrant$.subscribe(console.warn)

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

interval(1 / 30, animationFrameScheduler)
  .pipe(
    filter(() => !document.hidden),
    withLatestFrom(mousePoint$)
  )
  .subscribe(([_interval, canvasPoint]: [number, Point]) => {
    ctx.fillStyle = '#ccc'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    drawPoint(canvasPoint, '#f00', 4)
  })