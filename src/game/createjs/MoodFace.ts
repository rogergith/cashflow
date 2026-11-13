import { Container, Shape, Text } from '@createjs/easeljs'
import { Ease, Tween } from '@createjs/tweenjs'
import type { MoodId, MoodState } from '../mood'

const SKIN: Record<MoodId, string> = {
  waiting: '#94a3b8',
  stressed: '#f87171',
  worried: '#fb923c',
  neutral: '#fcd34d',
  hopeful: '#a3e635',
  happy: '#4ade80',
  euphoric: '#34d399',
}

/**
 * Rostro vectorial CreateJS. Cambia ojos/cejas/boca según el ánimo del cashflow.
 */
export class MoodFace {
  readonly root = new Container()
  private head = new Shape()
  private leftBrow = new Shape()
  private rightBrow = new Shape()
  private leftEye = new Shape()
  private rightEye = new Shape()
  private mouth = new Shape()
  private label = new Text('', '700 12px Segoe UI, system-ui, sans-serif', '#e2e8f0')
  private caption = new Text('', '400 10px Segoe UI, system-ui, sans-serif', '#94a3b8')
  private currentId: MoodId | null = null

  constructor() {
    this.label.textAlign = 'center'
    this.label.y = 48
    this.caption.textAlign = 'center'
    this.caption.y = 64
    this.root.addChild(
      this.head,
      this.leftBrow,
      this.rightBrow,
      this.leftEye,
      this.rightEye,
      this.mouth,
      this.label,
      this.caption,
    )
    this.apply({
      id: 'waiting',
      score: 50,
      label: 'En espera',
      detail: '',
    })
  }

  setMood(mood: MoodState): void {
    if (this.currentId === mood.id) {
      this.label.text = mood.label
      this.caption.text = mood.detail.length > 42 ? `${mood.detail.slice(0, 40)}…` : mood.detail
      return
    }
    this.currentId = mood.id
    this.apply(mood)
    this.root.scaleX = this.root.scaleY = 0.86
    Tween.get(this.root, { override: true })
      .to({ scaleX: 1.08, scaleY: 1.08 }, 140, Ease.quadOut)
      .to({ scaleX: 1, scaleY: 1 }, 140, Ease.quadInOut)
  }

  private apply(mood: MoodState): void {
    const skin = SKIN[mood.id]
    this.head.graphics.clear().beginFill(skin).drawCircle(0, 0, 36)
    this.head.graphics.beginStroke('rgba(15,23,42,0.35)').setStrokeStyle(2).drawCircle(0, 0, 36)

    this.drawEyes(mood.id)
    this.drawBrows(mood.id)
    this.drawMouth(mood.id)

    this.label.text = mood.label
    this.label.color = skin
    this.caption.text = mood.detail.length > 42 ? `${mood.detail.slice(0, 40)}…` : mood.detail
  }

  private drawEyes(id: MoodId): void {
    const gL = this.leftEye.graphics.clear()
    const gR = this.rightEye.graphics.clear()

    if (id === 'stressed') {
      // X eyes
      gL.beginStroke('#0f172a').setStrokeStyle(3)
      gL.moveTo(-18, -8).lineTo(-10, 0).moveTo(-10, -8).lineTo(-18, 0)
      gR.beginStroke('#0f172a').setStrokeStyle(3)
      gR.moveTo(10, -8).lineTo(18, 0).moveTo(18, -8).lineTo(10, 0)
      return
    }

    if (id === 'euphoric' || id === 'happy') {
      // happy arcs
      gL.beginStroke('#0f172a').setStrokeStyle(3)
      gL.moveTo(-20, -2).quadraticCurveTo(-14, -10, -8, -2)
      gR.beginStroke('#0f172a').setStrokeStyle(3)
      gR.moveTo(8, -2).quadraticCurveTo(14, -10, 20, -2)
      return
    }

    const r = id === 'worried' ? 3.2 : 4
    gL.beginFill('#0f172a').drawCircle(-14, -4, r)
    gR.beginFill('#0f172a').drawCircle(14, -4, r)
    if (id === 'hopeful') {
      gL.beginFill('#fff').drawCircle(-12.5, -5.5, 1.4)
      gR.beginFill('#fff').drawCircle(15.5, -5.5, 1.4)
    }
  }

  private drawBrows(id: MoodId): void {
    const gL = this.leftBrow.graphics.clear().beginStroke('#0f172a').setStrokeStyle(3)
    const gR = this.rightBrow.graphics.clear().beginStroke('#0f172a').setStrokeStyle(3)

    switch (id) {
      case 'stressed':
      case 'worried':
        gL.moveTo(-22, -16).lineTo(-8, -12)
        gR.moveTo(8, -12).lineTo(22, -16)
        break
      case 'hopeful':
      case 'happy':
      case 'euphoric':
        gL.moveTo(-22, -14).lineTo(-8, -16)
        gR.moveTo(8, -16).lineTo(22, -14)
        break
      case 'waiting':
        gL.moveTo(-20, -14).lineTo(-8, -14)
        gR.moveTo(8, -14).lineTo(20, -14)
        break
      default:
        gL.moveTo(-21, -15).lineTo(-9, -15)
        gR.moveTo(9, -15).lineTo(21, -15)
    }
  }

  private drawMouth(id: MoodId): void {
    const g = this.mouth.graphics.clear().beginStroke('#0f172a').setStrokeStyle(3)

    switch (id) {
      case 'euphoric':
        g.beginFill('#0f172a')
        g.moveTo(-14, 12).quadraticCurveTo(0, 28, 14, 12).closePath()
        break
      case 'happy':
        g.moveTo(-14, 12).quadraticCurveTo(0, 24, 14, 12)
        break
      case 'hopeful':
        g.moveTo(-12, 14).quadraticCurveTo(0, 20, 12, 14)
        break
      case 'neutral':
      case 'waiting':
        g.moveTo(-12, 14).lineTo(12, 14)
        break
      case 'worried':
        g.moveTo(-12, 18).quadraticCurveTo(0, 10, 12, 18)
        break
      case 'stressed':
        g.moveTo(-14, 16).quadraticCurveTo(0, 6, 14, 16)
        break
      default:
        g.moveTo(-12, 14).lineTo(12, 14)
    }
  }
}
