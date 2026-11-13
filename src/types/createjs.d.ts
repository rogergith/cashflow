declare module '@createjs/easeljs' {
  export class EventDispatcher {
    on(type: string, listener: (...args: unknown[]) => void, scope?: unknown): unknown
    off(type: string, listener: unknown): void
  }

  export class Ticker {
    static framerate: number
    static on(type: string, listener: (event: { delta: number }) => void): unknown
    static off(type: string, listener: unknown): void
    static removeAllEventListeners(type?: string): void
  }

  export class DisplayObject extends EventDispatcher {
    x: number
    y: number
    alpha: number
    scaleX: number
    scaleY: number
    rotation: number
    visible: boolean
    shadow: Shadow | null
  }

  export class Container extends DisplayObject {
    children: DisplayObject[]
    addChild(...children: DisplayObject[]): DisplayObject
    removeChild(...children: DisplayObject[]): void
    removeAllChildren(): void
  }

  export class Stage extends Container {
    constructor(canvas: HTMLCanvasElement | string)
    update(): void
    canvas: HTMLCanvasElement
  }

  export class Shape extends DisplayObject {
    graphics: Graphics
  }

  export class Text extends DisplayObject {
    constructor(text?: string, font?: string, color?: string)
    text: string
    font: string
    color: string
    textAlign: string
    textBaseline: string
    maxWidth: number | null
  }

  export class Shadow {
    constructor(color: string, offsetX: number, offsetY: number, blur: number)
  }

  export class Graphics {
    clear(): Graphics
    beginFill(color: string): Graphics
    beginStroke(color: string): Graphics
    setStrokeStyle(thickness: number, caps?: number | string, joints?: number | string): Graphics
    drawCircle(x: number, y: number, radius: number): Graphics
    drawEllipse(x: number, y: number, w: number, h: number): Graphics
    drawRect(x: number, y: number, w: number, h: number): Graphics
    drawRoundRect(x: number, y: number, w: number, h: number, radius: number): Graphics
    moveTo(x: number, y: number): Graphics
    lineTo(x: number, y: number): Graphics
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): Graphics
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): Graphics
    closePath(): Graphics
    endFill(): Graphics
    endStroke(): Graphics
  }
}

declare module '@createjs/tweenjs' {
  export class Tween {
    static get(target: object, props?: { override?: boolean; loop?: number | boolean }): Tween
    static removeTweens(target: object): void
    static removeAllTweens(): void
    wait(duration: number): Tween
    to(props: object, duration?: number, ease?: (t: number) => number): Tween
    call(callback: (...args: unknown[]) => void, params?: unknown[], scope?: unknown): Tween
  }

  export const Ease: {
    quadOut: (t: number) => number
    quadInOut: (t: number) => number
    bounceOut: (t: number) => number
    bounceIn: (t: number) => number
    sineInOut: (t: number) => number
  }
}
