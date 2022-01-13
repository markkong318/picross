import * as PIXI from 'pixi.js';
import gsap from 'gsap';

import {View} from '../../../../../framework/view';
import {Size} from '../../../../../framework/size';
import Bottle from '../../../../../framework/bottle';
import {PuzzleTexture} from '../../../../texture/puzzle-texture';

export class PuzzleView extends View {
  private posX: number;
  private posY: number;

  private clearXTimeline: gsap.core.Timeline;
  private colorizeTimeline: gsap.core.Timeline;
  private fullColorizeTimeline: gsap.core.Timeline;

  public size = new Size(32, 32);

  private backgroundTexture: PIXI.RenderTexture;
  private whiteTexture: PIXI.RenderTexture;
  private blackTexture: PIXI.RenderTexture;
  private xTexture: PIXI.RenderTexture;
  private fullTexture: PIXI.RenderTexture;

  private inputSprite: PIXI.Sprite;
  private clearXSprite: PIXI.Sprite;
  private colorSprite: PIXI.Sprite;
  private fullColorSprite: PIXI.Sprite;

  constructor(x: number, y: number) {
    super();

    this.posX = x;
    this.posY = y;
  }

  public init() {
    const puzzleTexture = <PuzzleTexture>Bottle.get('puzzleTexture');

    this.backgroundTexture = puzzleTexture.backgroundTexture;
    this.whiteTexture = puzzleTexture.whiteTexture;
    this.blackTexture = puzzleTexture.blackTexture;
    this.xTexture = puzzleTexture.xTexture;
    this.fullTexture = puzzleTexture.fullTexture;

    this.inputSprite = new PIXI.Sprite(this.backgroundTexture);
    this.addChild(this.inputSprite);

    this.clearXSprite = new PIXI.Sprite(this.whiteTexture);
    this.clearXSprite.alpha = 0;
    this.addChild(this.clearXSprite);

    this.colorSprite = new PIXI.Sprite(this.whiteTexture);
    this.colorSprite.alpha = 0;
    this.addChild(this.colorSprite);

    this.fullColorSprite = new PIXI.Sprite(this.fullTexture);
    this.fullColorSprite.alpha = 0;
    this.addChild(this.fullColorSprite);

    this.clearXTimeline = Bottle.get('clearXTimeline');
    this.colorizeTimeline = Bottle.get('colorizeTimeline');
    this.fullColorizeTimeline = Bottle.get('fullColorizeTimeline');
  }

  drawWhite() {
    this.inputSprite.texture = this.whiteTexture;
  }

  drawBlack() {
    this.inputSprite.texture = this.blackTexture;
  }

  drawX() {
    this.inputSprite.texture = this.xTexture;
  }

  clearX() {
    this.clearXTimeline.to(this.clearXSprite,
      {
        duration: 1,
        pixi: {
          alpha: 1,
        },
      }, 0);
  }

  drawColor(color) {
    this.colorSprite.tint = color;

    this.colorizeTimeline.to(this.colorSprite,
      {
        duration: 1,
        pixi: {
          alpha: 1,
        },
      }, 0);
  }

  drawFullColor(color) {
    this.fullColorSprite.tint = color;

    this.fullColorizeTimeline.to(this.fullColorSprite,
      {
        duration: 1,
        pixi: {
          alpha: 1,
        },
      }, 0);
  }
}
