import {
  Container,
  Shadow,
  Shape,
  Stage,
  Text,
  Ticker,
} from '@createjs/easeljs'
import { Ease, Tween } from '@createjs/tweenjs'
import { FAST_TRACK, RAT_RACE, getBoardSize, squareColor } from '../board'
import type { MoodState } from '../mood'
import type { Phase, Track } from '../types'
import { playLandFx, playWinFx } from './fx'
import { H, INNER_CELL, OUTER_CELL, W, outerRectCenters, pathSteps, ratRaceCenters } from './geometry'
import { SHORT_LABEL, drawIcon } from './icons'
import { MoodFace } from './MoodFace'

export interface BoardSyncProps {
  position: number | null
  lastRoll: number | null
  centerHint?: string
  phase: Phase
  mood: MoodState
  track: Track
  animateMove?: boolean
  justEscaped?: boolean
}

export class BoardStage {
  private stage: Stage
  private ambient = new Container()
  private outerBoard = new Container()
  private innerBoard = new Container()
  private tokenLayer = new Container()
  private fx = new Container()
  private hud = new Container()

  private ratCenters = ratRaceCenters(RAT_RACE.length)
  private outerCenters = outerRectCenters(FAST_TRACK.length)
  private ratNodes: Container[] = []
  private outerNodes: Container[] = []
  private ratGlow: Shape[] = []
  private outerGlow: Shape[] = []

  private token: Container
  private trackLabel: Text
  private titleText: Text
  private metaText: Text
  private hintText: Text
  private rollText: Text
  private rollLabel: Text
  private moodFace: MoodFace
  private particles: { shape: Shape; vx: number; vy: number }[] = []

  private displayedPos: number | null = null
  private displayedTrack: Track = 'rat_race'
  private animating = false
  private wonPlayed = false
  private escapePlayed = false
  private tickHandle: unknown = null
  private onAnimatingChange: ((value: boolean) => void) | null
  private lastMood: MoodState | null = null

  constructor(canvas: HTMLCanvasElement, onAnimatingChange?: (value: boolean) => void) {
    this.onAnimatingChange = onAnimatingChange ?? null
    this.stage = new Stage(canvas)
    this.stage.addChild(this.ambient, this.outerBoard, this.innerBoard, this.tokenLayer, this.fx, this.hud)

    this.buildBackground()
    this.buildAmbientParticles()
    this.buildOuterTrack()
    this.buildRatTrack()
    this.token = this.buildToken()
    this.tokenLayer.addChild(this.token)
    this.token.visible = false

    this.moodFace = new MoodFace()
    this.moodFace.root.x = W / 2
    this.moodFace.root.y = H / 2 + 8
    this.moodFace.root.scaleX = this.moodFace.root.scaleY = 0.72

    this.trackLabel = new Text('CARRERA DE LA RATA', '800 13px Segoe UI, system-ui, sans-serif', '#fbbf24')
    this.trackLabel.textAlign = 'center'
    this.trackLabel.x = W / 2
    this.trackLabel.y = H / 2 - 92

    this.titleText = new Text('CASHFLOW LAB', '700 16px Segoe UI, system-ui, sans-serif', '#e2e8f0')
    this.titleText.textAlign = 'center'
    this.titleText.x = W / 2
    this.titleText.y = H / 2 - 74

    this.metaText = new Text('Pasivo ≥ gastos → Fast Track', '400 11px Segoe UI, system-ui, sans-serif', '#94a3b8')
    this.metaText.textAlign = 'center'
    this.metaText.x = W / 2
    this.metaText.y = H / 2 - 56

    this.hintText = new Text('', '600 11px Segoe UI, system-ui, sans-serif', '#fbbf24')
    this.hintText.textAlign = 'center'
    this.hintText.maxWidth = 200
    this.hintText.x = W / 2
    this.hintText.y = H / 2 - 40

    this.rollText = new Text('', '700 36px Segoe UI, system-ui, sans-serif', '#38bdf8')
    this.rollText.textAlign = 'center'
    this.rollText.x = W / 2
    this.rollText.y = H / 2 + 78

    this.rollLabel = new Text('', '400 10px Segoe UI, system-ui, sans-serif', '#64748b')
    this.rollLabel.textAlign = 'center'
    this.rollLabel.x = W / 2
    this.rollLabel.y = H / 2 + 108

    this.hud.addChild(
      this.moodFace.root,
      this.trackLabel,
      this.titleText,
      this.metaText,
      this.hintText,
      this.rollText,
      this.rollLabel,
    )

    this.setOuterDimmed(true)

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
    const {
      position,
      lastRoll,
      centerHint,
      phase,
      mood,
      track,
      animateMove = true,
      justEscaped = false,
    } = props

    this.lastMood = mood
    if (!this.animating) this.moodFace.setMood(mood)

    this.trackLabel.text = track === 'fast_track' ? 'FAST TRACK' : 'CARRERA DE LA RATA'
    this.trackLabel.color = track === 'fast_track' ? '#34d399' : '#fbbf24'
    this.setOuterDimmed(track === 'rat_race')

    this.hintText.text = centerHint ?? (position == null ? 'Elige profesión →' : '')
    this.hintText.color = position == null ? '#64748b' : '#fbbf24'

    if (lastRoll != null) {
      if (this.rollText.text !== String(lastRoll)) {
        this.rollText.text = String(lastRoll)
        this.rollLabel.text = 'última tirada'
        this.rollText.scaleX = this.rollText.scaleY = 0.4
        this.rollText.alpha = 0
        Tween.get(this.rollText, { override: true })
          .to({ scaleX: 1.12, scaleY: 1.12, alpha: 1 }, 180, Ease.quadOut)
          .to({ scaleX: 1, scaleY: 1 }, 120, Ease.quadInOut)
      }
    } else {
      this.rollText.text = ''
      this.rollLabel.text = ''
    }

    if (justEscaped && !this.escapePlayed) {
      this.escapePlayed = true
      playWinFx(this.fx, W / 2, H / 2)
      this.trackLabel.scaleX = this.trackLabel.scaleY = 0.6
      Tween.get(this.trackLabel, { override: true })
        .to({ scaleX: 1.2, scaleY: 1.2 }, 220, Ease.quadOut)
        .to({ scaleX: 1, scaleY: 1 }, 180, Ease.quadInOut)
    }
    if (!justEscaped && track === 'rat_race') this.escapePlayed = false

    if (phase === 'won' && !this.wonPlayed) {
      this.wonPlayed = true
      playWinFx(this.fx, W / 2, H / 2)
    }
    if (phase !== 'won') this.wonPlayed = false

    if (position == null) {
      Tween.removeTweens(this.token)
      this.setAnimating(false)
      this.token.visible = false
      this.displayedPos = null
      this.setActiveSquare(null, track)
      return
    }

    this.token.visible = true

    const trackChanged = this.displayedTrack !== track
    if (trackChanged) {
      this.displayedTrack = track
      this.snapToken(position, track)
      return
    }

    if (this.displayedPos == null || !animateMove || this.displayedPos === position) {
      this.snapToken(position, track)
      return
    }

    if (this.animating) return
    void this.animateToken(this.displayedPos, position, track)
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

  private centersFor(track: Track) {
    return track === 'fast_track' ? this.outerCenters : this.ratCenters
  }

  private snapToken(position: number, track: Track): void {
    const c = this.centersFor(track)[position]
    if (!c) return
    Tween.removeTweens(this.token)
    this.token.x = c.x
    this.token.y = c.y
    this.displayedPos = position
    this.displayedTrack = track
    this.setActiveSquare(position, track)
  }

  private async animateToken(from: number, to: number, track: Track): Promise<void> {
    this.setAnimating(true)
    this.moodFace.setMood({
      id: 'hopeful',
      score: 62,
      label: 'Expectante',
      detail: track === 'rat_race' ? 'En la rata… ¿qué sale?' : 'Fast Track: persiguiendo el sueño…',
    })

    const size = getBoardSize(track)
    const centers = this.centersFor(track)
    const steps = pathSteps(from, to, size)
    const board = track === 'fast_track' ? FAST_TRACK : RAT_RACE

    for (const step of steps) {
      const c = centers[step]
      if (!c) continue
      this.setActiveSquare(step, track)
      await tweenPromise(
        Tween.get(this.token, { override: true }).to({ x: c.x, y: c.y - 12 }, 80, Ease.quadOut),
      )
      await tweenPromise(
        Tween.get(this.token, { override: true }).to({ x: c.x, y: c.y }, 80, Ease.bounceOut),
      )
      this.displayedPos = step
    }

    const land = board[to]
    const c = centers[to]
    if (land && c) {
      playLandFx(this.fx, land.kind, c.x, c.y)
      this.pulseSquare(to, track)
    }

    if (this.lastMood) this.moodFace.setMood(this.lastMood)
    this.setAnimating(false)
  }

  private setActiveSquare(index: number | null, track: Track): void {
    const glows = track === 'fast_track' ? this.outerGlow : this.ratGlow
    const other = track === 'fast_track' ? this.ratGlow : this.outerGlow
    other.forEach((g) => {
      g.visible = false
      Tween.removeTweens(g)
    })
    glows.forEach((g, i) => {
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

  private pulseSquare(index: number, track: Track): void {
    const nodes = track === 'fast_track' ? this.outerNodes : this.ratNodes
    const node = nodes[index]
    if (!node) return
    Tween.get(node, { override: true })
      .to({ scaleX: 1.1, scaleY: 1.1 }, 120, Ease.quadOut)
      .to({ scaleX: 1, scaleY: 1 }, 160, Ease.quadInOut)
  }

  private setOuterDimmed(dim: boolean): void {
    this.outerBoard.alpha = dim ? 0.35 : 1
    this.innerBoard.alpha = dim ? 1 : 0.55
  }

  private buildBackground(): void {
    const bg = new Shape()
    bg.graphics.beginFill('#0b1220').drawRect(0, 0, W, H)
    const ring = new Shape()
    ring.graphics.beginStroke('rgba(251,191,36,0.15)').setStrokeStyle(2).drawCircle(W / 2, H / 2, 168)
    const veil = new Shape()
    veil.graphics.beginFill('rgba(30,58,95,0.28)').drawCircle(W * 0.2, H * 0.15, 200)
    const center = new Shape()
    center.graphics.beginFill('rgba(15,23,42,0.88)').drawCircle(W / 2, H / 2, 118)
    this.ambient.addChild(bg, veil, ring, center)
  }

  private buildAmbientParticles(): void {
    for (let i = 0; i < 30; i++) {
      const shape = new Shape()
      const r = 1.2 + Math.random() * 2
      shape.graphics.beginFill(i % 3 === 0 ? '#38bdf8' : '#94a3b8').drawCircle(0, 0, r)
      shape.alpha = 0.12 + Math.random() * 0.3
      shape.x = Math.random() * W
      shape.y = Math.random() * H
      this.ambient.addChild(shape)
      this.particles.push({
        shape,
        vx: (Math.random() - 0.5) * 0.22,
        vy: -0.04 - Math.random() * 0.18,
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

  private buildRatTrack(): void {
    RAT_RACE.forEach((sq, i) => {
      const c = this.ratCenters[i]!
      const node = this.makeSquare(sq.kind, INNER_CELL, true)
      node.x = c.x
      node.y = c.y
      const glow = node.children[0] as Shape
      this.ratGlow[i] = glow
      this.innerBoard.addChild(node)
      this.ratNodes[i] = node
    })
  }

  private buildOuterTrack(): void {
    FAST_TRACK.forEach((sq, i) => {
      const c = this.outerCenters[i]!
      const node = this.makeSquare(sq.kind, OUTER_CELL, false)
      node.x = c.x
      node.y = c.y
      const glow = node.children[0] as Shape
      this.outerGlow[i] = glow
      this.outerBoard.addChild(node)
      this.outerNodes[i] = node
    })
  }

  private makeSquare(kind: (typeof RAT_RACE)[0]['kind'], cell: number, small: boolean): Container {
    const node = new Container()
    const half = cell / 2
    const glow = new Shape()
    glow.graphics.beginStroke('#fbbf24').setStrokeStyle(2.5).drawRoundRect(-half, -half, cell - 2, cell - 2, 10)
    glow.visible = false
    glow.shadow = new Shadow('#fbbf24', 0, 0, 12)

    const body = new Shape()
    body.graphics.beginFill(squareColor(kind)).drawRoundRect(-half + 2, -half + 2, cell - 6, cell - 6, 8)

    const icon = new Shape()
    drawIcon(icon.graphics, kind, small ? 10 : 11)
    icon.y = -8

    const label = new Text(SHORT_LABEL[kind], `700 ${small ? 9 : 10}px Segoe UI, system-ui, sans-serif`, '#fff')
    label.textAlign = 'center'
    label.textBaseline = 'middle'
    label.y = 14

    node.addChild(glow, body, icon, label)
    return node
  }

  private buildToken(): Container {
    const token = new Container()
    const ring = new Shape()
    ring.graphics.beginFill('#fbbf24').drawCircle(0, 0, 11)
    ring.graphics.beginStroke('#78350f').setStrokeStyle(2).drawCircle(0, 0, 11)
    const label = new Text('TÚ', '700 9px Segoe UI, system-ui, sans-serif', '#78350f')
    label.textAlign = 'center'
    label.textBaseline = 'middle'
    token.addChild(ring, label)
    token.shadow = new Shadow('rgba(251,191,36,0.55)', 0, 0, 10)
    return token
  }
}

function tweenPromise(tween: Tween): Promise<void> {
  return new Promise((resolve) => {
    tween.call(() => resolve())
  })
}
