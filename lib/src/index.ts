import { fromEvent, animationFrameScheduler, interval, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

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

const mouseEventToCanvasPoint = ({ clientX, clientY }: MouseEvent): Point => {
  const { left, top } = canvas.getBoundingClientRect()
  const x = clientX - left
  const y = clientY - top
  return { x, y }
}

const canvasPoint$: Observable<Point> = fromEvent(document, 'mousemove')
  .pipe(
    map(mouseEventToCanvasPoint)
  )

canvasPoint$.subscribe((point: Point) => {
  console.log(point)
})

interval(0, animationFrameScheduler)
  .subscribe(() => {
    ctx.fillStyle = '#ccc'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  })