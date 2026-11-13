import {
  Container,
  Shadow,
  Shape,
  Stage,
  Text,
  Ticker,
} from '@createjs/easeljs'
import { Ease, Tween } from '@createjs/tweenjs'
import { BOARD, BOARD_SIZE, squareColor } from '../board'
import type { MoodState } from '../mood'
import type { Phase } from '../types'
import { playLandFx, playWinFx } from './fx'
import { CELL, H, PAD, W, pathSteps, squareCenters } from './geometry'
import { SHORT_LABEL, drawIcon } from './icons'
import { MoodFace } from './MoodFace'

export interface BoardSyncProps {
  position: number | null
  lastRoll: number | null
  centerHint?: string
  phase: Phase
  mood: MoodState
  animateMove?: boolean
}

export class BoardStage {
  private stage: Stage
  private ambient = new Container()
  private board = new Container()
  private tokenLayer = new Container()
  private fx = new Container()
  private hud = new Container()

  private centers = squareCenters()
  private squareNodes: Container[] = []
  private glowNodes: Shape[] = []
  private token: Container
  private titleText: Text
  private metaText: Text
  private hintText: Text
  private rollText: Text
  private rollLabel: Text
  private moodFace: MoodFace
  private particles: { shape: Shape; vx: number; vy: number }[] = []

  private displayedPos: number | null = null
  private animating = false
  private wonPlayed = false
  private tickHandle: unknown = null
  private onAnimatingChange: ((value: boolean) => void) | null
  private lastMood: MoodState | null = null

  constructor(canvas: HTMLCanvasElement, onAnimatingChange?: (value: boolean) => void) {
    this.onAnimatingChange = onAnimatingChange ?? null
    this.stage = new Stage(canvas)

    this.stage.addChild(this.ambient, this.board, this.tokenLayer, this.fx, this.hud)

    this.buildBackground()
    this.buildAmbientParticles()
    this.buildSquares()
    this.token = this.buildToken()
    this.tokenLayer.addChild(this.token)
    this.token.visible = false

    this.moodFace = new MoodFace()
    this.moodFace.root.x = W / 2 - 100
    this.moodFace.root.y = H / 2 + 4

    this.titleText = new Text('CASHFLOW LAB', '700 18px Segoe UI, system-ui, sans-serif', '#e2e8f0')
    this.titleText.textAlign = 'left'
    this.titleText.x = W / 2 + 8
    this.titleText.y = H / 2 - 78

    this.metaText = new Text('Meta: ingreso pasivo ≥ gastos', '400 11px Segoe UI, system-ui, sans-serif', '#94a3b8')
    this.metaText.textAlign = 'left'
    this.metaText.x = W / 2 + 8
    this.metaText.y = H / 2 - 56

    this.hintText = new Text('', '600 12px Segoe UI, system-ui, sans-serif', '#fbbf24')
    this.hintText.textAlign = 'left'
    this.hintText.maxWidth = 210
    this.hintText.x = W / 2 + 8
    this.hintText.y = H / 2 - 34

    this.rollText = new Text('', '700 46px Segoe UI, system-ui, sans-serif', '#38bdf8')
    this.rollText.textAlign = 'left'
    this.rollText.x = W / 2 + 8
    this.rollText.y = H / 2 + 18

    this.rollLabel = new Text('', '400 11px Segoe UI, system-ui, sans-serif', '#64748b')
    this.rollLabel.textAlign = 'left'
    this.rollLabel.x = W / 2 + 8
    this.rollLabel.y = H / 2 + 56

    this.hud.addChild(
      this.moodFace.root,
      this.titleText,
      this.metaText,
      this.hintText,
      this.rollText,
      this.rollLabel,
    )

    Ticker.framerate = 60
    this.tickHandle = Ticker.on('tick', () => {
      this.updateParticles()
      this.stage.update()
    })
  }

  isAnimating(): boolean {
    return this.animating
  }

  sync(props: BoardSyncProps): void {
    const { position, lastRoll, centerHint, phase, mood, animateMove = true } = props

    this.lastMood = mood
    if (!this.animating) this.moodFace.setMood(mood)

    this.hintText.text = centerHint ?? (position == null ? 'Elige una profesión a la derecha →' : '')
    this.hintText.color = position == null ? '#64748b' : '#fbbf24'

    if (lastRoll != null) {
      if (this.rollText.text !== String(lastRoll)) {
        this.rollText.text = String(lastRoll)
        this.rollLabel.text = 'última tirada'
        this.rollText.scaleX = this.rollText.scaleY = 0.4
        this.rollText.alpha = 0
        Tween.get(this.rollText, { override: true })
          .to({ scaleX: 1.15, scaleY: 1.15, alpha: 1 }, 180, Ease.quadOut)
          .to({ scaleX: 1, scaleY: 1 }, 120, Ease.quadInOut)
      }
    } else {
      this.rollText.text = ''
      this.rollLabel.text = ''
    }

    if (phase === 'won' && !this.wonPlayed) {
      this.wonPlayed = true
      playWinFx(this.fx, W / 2, H / 2)
      Tween.get(this.titleText, { override: true })
        .to({ scaleX: 1.08, scaleY: 1.08 }, 220, Ease.quadOut)
        .to({ scaleX: 1, scaleY: 1 }, 220, Ease.quadInOut)
    }
    if (phase !== 'won') this.wonPlayed = false

    if (position == null) {
      Tween.removeTweens(this.token)
      this.setAnimating(false)
      this.token.visible = false
      this.displayedPos = null
      this.setActiveSquare(null)
      return
    }

    this.token.visible = true

    if (this.displayedPos == null || !animateMove || this.displayedPos === position) {
      this.snapToken(position)
      return
    }

    if (this.animating) return
    void this.animateToken(this.displayedPos, position)
  }

  destroy(): void {
    if (this.tickHandle) Ticker.off('tick', this.tickHandle)
    Tween.removeAllTweens()
    this.stage.removeAllChildren()
  }

  private setAnimating(value: boolean): void {
    this.animating = value
    this.onAnimatingChange?.(value)
  }

  private snapToken(position: number): void {
    const c = this.centers[position]
    if (!c) return
    Tween.removeTweens(this.token)
    this.token.x = c.x
    this.token.y = c.y
    this.displayedPos = position
    this.setActiveSquare(position)
  }

  private async animateToken(from: number, to: number): Promise<void> {
    this.setAnimating(true)
    this.moodFace.setMood({
      id: 'hopeful',
      score: 62,
      label: 'Expectante',
      detail: 'Traje en alerta: los dados deciden lo que se avecina…',
    })
    const steps = pathSteps(from, to, BOARD_SIZE)

    for (const step of steps) {
      const c = this.centers[step]
      if (!c) continue
      this.setActiveSquare(step)
      await tweenPromise(
        Tween.get(this.token, { override: true }).to(
          { x: c.x, y: c.y - 14 },
          90,
          Ease.quadOut,
        ),
      )
      await tweenPromise(
        Tween.get(this.token, { override: true }).to({ x: c.x, y: c.y }, 90, Ease.bounceOut),
      )
      this.displayedPos = step
    }

    const land = BOARD[to]
    const c = this.centers[to]
    if (land && c) {
      playLandFx(this.fx, land.kind, c.x, c.y)
      this.pulseSquare(to)
    }

    if (this.lastMood) this.moodFace.setMood(this.lastMood)
    this.setAnimating(false)
  }

  private setActiveSquare(index: number | null): void {
    this.glowNodes.forEach((g, i) => {
      g.visible = index === i
      if (index === i) {
        g.alpha = 0.9
        Tween.get(g, { override: true, loop: -1 })
          .to({ alpha: 0.35 }, 500, Ease.sineInOut)
          .to({ alpha: 0.9 }, 500, Ease.sineInOut)
      } else {
        Tween.removeTweens(g)
      }
    })
  }

  private pulseSquare(index: number): void {
    const node = this.squareNodes[index]
    if (!node) return
    Tween.get(node, { override: true })
      .to({ scaleX: 1.08, scaleY: 1.08 }, 120, Ease.quadOut)
      .to({ scaleX: 1, scaleY: 1 }, 160, Ease.quadInOut)
  }

  private buildBackground(): void {
    const bg = new Shape()
    bg.graphics.beginFill('#0f172a').drawRect(0, 0, W, H)
    const veil = new Shape()
    veil.graphics.beginFill('rgba(30,58,95,0.35)').drawCircle(W * 0.2, H * 0.15, 220)
    const veil2 = new Shape()
    veil2.graphics.beginFill('rgba(20,83,45,0.2)').drawCircle(W * 0.85, H * 0.2, 180)

    const center = new Shape()
    center.graphics
      .beginFill('rgba(15,23,42,0.92)')
      .drawRoundRect(
        PAD + CELL * 0.7,
        PAD + CELL * 0.7,
        W - (PAD + CELL * 0.7) * 2,
        H - (PAD + CELL * 0.7) * 2,
        18,
      )

    this.ambient.addChild(bg, veil, veil2, center)
  }

  private buildAmbientParticles(): void {
    for (let i = 0; i < 36; i++) {
      const shape = new Shape()
      const r = 1.2 + Math.random() * 2.2
      shape.graphics.beginFill(i % 3 === 0 ? '#38bdf8' : '#94a3b8').drawCircle(0, 0, r)
      shape.alpha = 0.15 + Math.random() * 0.35
      shape.x = Math.random() * W
      shape.y = Math.random() * H
      this.ambient.addChild(shape)
      this.particles.push({
        shape,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.05 - Math.random() * 0.2,
      })
    }
  }

  private updateParticles(): void {
    for (const p of this.particles) {
      p.shape.x += p.vx
      p.shape.y += p.vy
      if (p.shape.y < -10) p.shape.y = H + 10
      if (p.shape.x < -10) p.shape.x = W + 10
      if (p.shape.x > W + 10) p.shape.x = -10
    }
  }

  private buildSquares(): void {
    BOARD.forEach((sq, i) => {
      const c = this.centers[i]!
      const node = new Container()
      node.x = c.x
      node.y = c.y

      const glow = new Shape()
      glow.graphics.beginStroke('#fbbf24').setStrokeStyle(3).drawRoundRect(-CELL / 2, -CELL / 2, CELL - 2, CELL - 2, 12)
      glow.visible = false
      glow.shadow = new Shadow('#fbbf24', 0, 0, 16)
      this.glowNodes[i] = glow

      const body = new Shape()
      body.graphics
        .beginFill(squareColor(sq.kind))
        .drawRoundRect(-CELL / 2 + 3, -CELL / 2 + 3, CELL - 6, CELL - 6, 10)

      const icon = new Shape()
      drawIcon(icon.graphics, sq.kind, 13)
      icon.y = -10

      const label = new Text(SHORT_LABEL[sq.kind], '700 11px Segoe UI, system-ui, sans-serif', '#fff')
      label.textAlign = 'center'
      label.textBaseline = 'middle'
      label.y = 18

      node.addChild(glow, body, icon, label)
      this.board.addChild(node)
      this.squareNodes[i] = node
    })
  }

  private buildToken(): Container {
    const token = new Container()
    const ring = new Shape()
    ring.graphics.beginFill('#fbbf24').drawCircle(0, 0, 13)
    ring.graphics.beginStroke('#78350f').setStrokeStyle(2).drawCircle(0, 0, 13)
    const label = new Text('TÚ', '700 10px Segoe UI, system-ui, sans-serif', '#78350f')
    label.textAlign = 'center'
    label.textBaseline = 'middle'
    token.addChild(ring, label)
    token.shadow = new Shadow('rgba(251,191,36,0.55)', 0, 0, 12)
    return token
  }
}

function tweenPromise(tween: Tween): Promise<void> {
  return new Promise((resolve) => {
    tween.call(() => resolve())
  })
}
