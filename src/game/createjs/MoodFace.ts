import { Container, Shape, Text } from '@createjs/easeljs'
import { Ease, Tween } from '@createjs/tweenjs'
import type { MoodId, MoodState } from '../mood'

interface SuitPalette {
  jacket: string
  shirt: string
  tie: string
  pants: string
  shoes: string
  skin: string
  hair: string
}

const SUIT: Record<MoodId, SuitPalette> = {
  waiting: {
    jacket: '#6b7280',
    shirt: '#f1f5f9',
    tie: '#9ca3af',
    pants: '#4b5563',
    shoes: '#111827',
    skin: '#f3c9a3',
    hair: '#374151',
  },
  stressed: {
    jacket: '#991b1b',
    shirt: '#fee2e2',
    tie: '#450a0a',
    pants: '#7f1d1d',
    shoes: '#1c1917',
    skin: '#efc2a0',
    hair: '#1f2937',
  },
  worried: {
    jacket: '#c2410c',
    shirt: '#ffedd5',
    tie: '#9a3412',
    pants: '#7c2d12',
    shoes: '#1c1917',
    skin: '#f0c4a0',
    hair: '#1f2937',
  },
  neutral: {
    jacket: '#1e40af',
    shirt: '#f8fafc',
    tie: '#0f172a',
    pants: '#172554',
    shoes: '#020617',
    skin: '#f3c9a3',
    hair: '#111827',
  },
  hopeful: {
    jacket: '#1d4ed8',
    shirt: '#eff6ff',
    tie: '#38bdf8',
    pants: '#1e3a8a',
    shoes: '#020617',
    skin: '#f3c9a3',
    hair: '#111827',
  },
  happy: {
    jacket: '#0f766e',
    shirt: '#ecfdf5',
    tie: '#34d399',
    pants: '#115e59',
    shoes: '#022c22',
    skin: '#f5d0ad',
    hair: '#111827',
  },
  euphoric: {
    jacket: '#111827',
    shirt: '#fffbeb',
    tie: '#fbbf24',
    pants: '#030712',
    shoes: '#b45309',
    skin: '#f6d4b2',
    hair: '#0f172a',
  },
}

interface Pose {
  leftArmRot: number
  rightArmRot: number
  bodyTilt: number
  headTilt: number
  headY: number
}

const POSE: Record<MoodId, Pose> = {
  waiting: { leftArmRot: 18, rightArmRot: -18, bodyTilt: 0, headTilt: 0, headY: 0 },
  stressed: { leftArmRot: 48, rightArmRot: -48, bodyTilt: 5, headTilt: 10, headY: 3 },
  worried: { leftArmRot: 28, rightArmRot: -12, bodyTilt: 3, headTilt: -8, headY: 2 },
  neutral: { leftArmRot: 10, rightArmRot: -10, bodyTilt: 0, headTilt: 0, headY: 0 },
  hopeful: { leftArmRot: -30, rightArmRot: -10, bodyTilt: -2, headTilt: -5, headY: -1 },
  happy: { leftArmRot: -45, rightArmRot: 45, bodyTilt: 0, headTilt: 0, headY: -2 },
  euphoric: { leftArmRot: -75, rightArmRot: 75, bodyTilt: 0, headTilt: -3, headY: -4 },
}

/**
 * Persona de cuerpo completo con traje legible (cuello, corbata, solapas, mangas).
 */
export class MoodFace {
  readonly root = new Container()
  private figure = new Container()
  private leftArm = new Container()
  private rightArm = new Container()
  private torso = new Container()
  private headGroup = new Container()

  private leftSleeve = new Shape()
  private rightSleeve = new Shape()
  private leftHand = new Shape()
  private rightHand = new Shape()
  private jacket = new Shape()
  private lapels = new Shape()
  private shirt = new Shape()
  private collar = new Shape()
  private tie = new Shape()
  private pants = new Shape()
  private leftShoe = new Shape()
  private rightShoe = new Shape()
  private head = new Shape()
  private hair = new Shape()
  private leftBrow = new Shape()
  private rightBrow = new Shape()
  private leftEye = new Shape()
  private rightEye = new Shape()
  private mouth = new Shape()
  private earL = new Shape()
  private earR = new Shape()

  private label = new Text('', '700 13px Segoe UI, system-ui, sans-serif', '#e2e8f0')
  private caption = new Text('', '400 10px Segoe UI, system-ui, sans-serif', '#94a3b8')
  private currentId: MoodId | null = null

  constructor() {
    this.buildFigure()
    this.label.textAlign = 'center'
    this.label.y = 86
    this.caption.textAlign = 'center'
    this.caption.y = 103
    this.root.addChild(this.figure, this.label, this.caption)
    this.apply({
      id: 'waiting',
      score: 50,
      label: 'En espera',
      detail: '',
    })
  }

  setMood(mood: MoodState): void {
    const same = this.currentId === mood.id
    this.label.text = mood.label
    this.caption.text = truncate(mood.detail, 40)
    if (same) return

    this.currentId = mood.id
    this.apply(mood)

    this.figure.scaleX = this.figure.scaleY = 0.94
    Tween.get(this.figure, { override: true })
      .to({ scaleX: 1.04, scaleY: 1.04 }, 140, Ease.quadOut)
      .to({ scaleX: 1, scaleY: 1 }, 140, Ease.quadInOut)

    const pose = POSE[mood.id]
    Tween.get(this.leftArm, { override: true }).to({ rotation: pose.leftArmRot }, 260, Ease.quadOut)
    Tween.get(this.rightArm, { override: true }).to({ rotation: pose.rightArmRot }, 260, Ease.quadOut)
    Tween.get(this.torso, { override: true }).to({ rotation: pose.bodyTilt }, 260, Ease.quadOut)
    Tween.get(this.headGroup, { override: true }).to(
      { rotation: pose.headTilt, y: -52 + pose.headY },
      260,
      Ease.quadOut,
    )
  }

  private buildFigure(): void {
    this.leftArm.x = -17
    this.leftArm.y = -14
    this.rightArm.x = 17
    this.rightArm.y = -14
    this.leftArm.addChild(this.leftSleeve, this.leftHand)
    this.rightArm.addChild(this.rightSleeve, this.rightHand)

    this.torso.addChild(
      this.pants,
      this.leftShoe,
      this.rightShoe,
      this.jacket,
      this.shirt,
      this.collar,
      this.lapels,
      this.tie,
    )

    this.headGroup.y = -52
    this.headGroup.addChild(
      this.earL,
      this.earR,
      this.head,
      this.hair,
      this.leftBrow,
      this.rightBrow,
      this.leftEye,
      this.rightEye,
      this.mouth,
    )

    // Order: back arm feel — arms behind torso slightly by draw order of sleeves under jacket edges
    this.figure.addChild(this.leftArm, this.rightArm, this.torso, this.headGroup)
  }

  private apply(mood: MoodState): void {
    const suit = SUIT[mood.id]
    const pose = POSE[mood.id]

    this.drawBody(suit)
    this.drawHead(suit, mood.id)

    this.leftArm.rotation = pose.leftArmRot
    this.rightArm.rotation = pose.rightArmRot
    this.torso.rotation = pose.bodyTilt
    this.headGroup.rotation = pose.headTilt
    this.headGroup.y = -52 + pose.headY

    this.label.color = suit.tie === '#0f172a' ? '#93c5fd' : suit.tie
  }

  private drawBody(suit: SuitPalette): void {
    // Legs with slight gap
    this.pants.graphics
      .clear()
      .beginFill(suit.pants)
      .drawRoundRect(-13, 20, 11, 36, 3)
      .drawRoundRect(2, 20, 11, 36, 3)

    this.leftShoe.graphics.clear().beginFill(suit.shoes).drawRoundRect(-15, 52, 14, 6, 2)
    this.rightShoe.graphics.clear().beginFill(suit.shoes).drawRoundRect(1, 52, 14, 6, 2)

    // Jacket body — tapered
    this.jacket.graphics
      .clear()
      .beginFill(suit.jacket)
      .moveTo(-18, -20)
      .lineTo(-20, 22)
      .lineTo(-2, 24)
      .lineTo(2, 24)
      .lineTo(20, 22)
      .lineTo(18, -20)
      .closePath()

    // Shirt placket
    this.shirt.graphics
      .clear()
      .beginFill(suit.shirt)
      .drawRect(-5, -16, 10, 34)

    // Collar points
    this.collar.graphics
      .clear()
      .beginFill(suit.shirt)
      .moveTo(-9, -20)
      .lineTo(-1, -12)
      .lineTo(-9, -10)
      .closePath()
      .moveTo(9, -20)
      .lineTo(1, -12)
      .lineTo(9, -10)
      .closePath()

    // Lapels
    this.lapels.graphics
      .clear()
      .beginFill(darken(suit.jacket, 0.18))
      .moveTo(-8, -18)
      .lineTo(-16, 8)
      .lineTo(-6, 6)
      .closePath()
      .moveTo(8, -18)
      .lineTo(16, 8)
      .lineTo(6, 6)
      .closePath()

    // Tie knot + blade
    this.tie.graphics
      .clear()
      .beginFill(suit.tie)
      .drawRoundRect(-3.5, -14, 7, 5, 1)
      .moveTo(0, -9)
      .lineTo(-4.5, 18)
      .lineTo(0, 22)
      .lineTo(4.5, 18)
      .closePath()

    // Sleeves (narrower, longer)
    this.leftSleeve.graphics
      .clear()
      .beginFill(suit.jacket)
      .drawRoundRect(-6, -2, 12, 32, 5)
    this.rightSleeve.graphics
      .clear()
      .beginFill(suit.jacket)
      .drawRoundRect(-6, -2, 12, 32, 5)

    this.leftHand.graphics.clear().beginFill(suit.skin).drawCircle(0, 32, 5.5)
    this.rightHand.graphics.clear().beginFill(suit.skin).drawCircle(0, 32, 5.5)

    // Cuff hint
    this.leftSleeve.graphics.beginFill(suit.shirt).drawRect(-5, 26, 10, 3)
    this.rightSleeve.graphics.beginFill(suit.shirt).drawRect(-5, 26, 10, 3)
  }

  private drawHead(suit: SuitPalette, id: MoodId): void {
    this.earL.graphics.clear().beginFill(suit.skin).drawEllipse(-19, -4, 7, 9)
    this.earR.graphics.clear().beginFill(suit.skin).drawEllipse(12, -4, 7, 9)

    this.head.graphics.clear().beginFill(suit.skin).drawCircle(0, 0, 17)
    this.head.graphics.beginStroke('rgba(15,23,42,0.2)').setStrokeStyle(1).drawCircle(0, 0, 17)

    this.hair.graphics
      .clear()
      .beginFill(suit.hair)
      .drawEllipse(-15, -17, 30, 13)
      .beginFill(suit.hair)
      .drawCircle(-12, -10, 5)
      .drawCircle(12, -10, 5)

    this.drawEyes(id)
    this.drawBrows(id)
    this.drawMouth(id)
  }

  private drawEyes(id: MoodId): void {
    const gL = this.leftEye.graphics.clear()
    const gR = this.rightEye.graphics.clear()

    if (id === 'stressed') {
      gL.beginStroke('#0f172a').setStrokeStyle(2.2)
      gL.moveTo(-9, -3).lineTo(-3, 2).moveTo(-3, -3).lineTo(-9, 2)
      gR.beginStroke('#0f172a').setStrokeStyle(2.2)
      gR.moveTo(3, -3).lineTo(9, 2).moveTo(9, -3).lineTo(3, 2)
      return
    }

    if (id === 'euphoric' || id === 'happy') {
      gL.beginStroke('#0f172a').setStrokeStyle(2.2)
      gL.moveTo(-10, 0).quadraticCurveTo(-6.5, -5, -3, 0)
      gR.beginStroke('#0f172a').setStrokeStyle(2.2)
      gR.moveTo(3, 0).quadraticCurveTo(6.5, -5, 10, 0)
      return
    }

    const r = id === 'worried' ? 2.1 : 2.5
    gL.beginFill('#0f172a').drawCircle(-6.5, -1, r)
    gR.beginFill('#0f172a').drawCircle(6.5, -1, r)
    if (id === 'hopeful' || id === 'neutral') {
      gL.beginFill('#fff').drawCircle(-5.6, -1.8, 0.8)
      gR.beginFill('#fff').drawCircle(7.4, -1.8, 0.8)
    }
  }

  private drawBrows(id: MoodId): void {
    const gL = this.leftBrow.graphics.clear().beginStroke('#0f172a').setStrokeStyle(2)
    const gR = this.rightBrow.graphics.clear().beginStroke('#0f172a').setStrokeStyle(2)

    switch (id) {
      case 'stressed':
      case 'worried':
        gL.moveTo(-11, -8).lineTo(-3, -5)
        gR.moveTo(3, -5).lineTo(11, -8)
        break
      case 'hopeful':
      case 'happy':
      case 'euphoric':
        gL.moveTo(-11, -7).lineTo(-3, -9)
        gR.moveTo(3, -9).lineTo(11, -7)
        break
      default:
        gL.moveTo(-10, -7).lineTo(-3, -7)
        gR.moveTo(3, -7).lineTo(10, -7)
    }
  }

  private drawMouth(id: MoodId): void {
    const g = this.mouth.graphics.clear().beginStroke('#0f172a').setStrokeStyle(2)

    switch (id) {
      case 'euphoric':
        g.beginFill('#0f172a')
        g.moveTo(-7, 6).quadraticCurveTo(0, 13, 7, 6).closePath()
        break
      case 'happy':
        g.moveTo(-7, 6).quadraticCurveTo(0, 11, 7, 6)
        break
      case 'hopeful':
        g.moveTo(-6, 7).quadraticCurveTo(0, 10, 6, 7)
        break
      case 'worried':
        g.moveTo(-6, 9).quadraticCurveTo(0, 5, 6, 9)
        break
      case 'stressed':
        g.moveTo(-7, 8).quadraticCurveTo(0, 3, 7, 8)
        break
      default:
        g.moveTo(-6, 7).lineTo(6, 7)
    }
  }
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function darken(hex: string, amount: number): string {
  const n = hex.replace('#', '')
  if (n.length !== 6) return hex
  const r = Math.max(0, Math.round(parseInt(n.slice(0, 2), 16) * (1 - amount)))
  const g = Math.max(0, Math.round(parseInt(n.slice(2, 4), 16) * (1 - amount)))
  const b = Math.max(0, Math.round(parseInt(n.slice(4, 6), 16) * (1 - amount)))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
