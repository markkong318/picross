import * as PIXI from 'pixi.js';
import gsap from 'gsap';

import {View} from '../../../../../framework/view';
import {Size} from '../../../../../framework/size';
import Bottle from '../../../../../framework/bottle';

export class PuzzleView extends View {
  private graphics: PIXI.Graphics;
  private posX: number;
  private posY: number;

  private clearXTimeline: gsap.core.Timeline;
  private colorizeTimeline: gsap.core.Timeline;
  private fullColorizeTimeline: gsap.core.Timeline;

  public size = new Size(32, 32);

  constructor(x: number, y: number) {
    super();

    this.posX = x;
    this.posY = y;
  }

  public init() {
    this.graphics = new PIXI.Graphics();

    this.graphics.beginFill(0x323334);
    this.graphics.drawRoundedRect(1, 1, this.size.width - 2, this.size.height - 2, 5);

    this.addChild(this.graphics);

    this.clearXTimeline = Bottle.get('clearXTimeline');
    this.colorizeTimeline = Bottle.get('colorizeTimeline');
    this.fullColorizeTimeline = Bottle.get('fullColorizeTimeline');
  }

  drawWhite() {
    this.graphics.beginFill(0xffffff);
    this.graphics.drawRoundedRect(1, 1, this.size.width - 2, this.size.height - 2, 5);
  }

  drawBlack() {
    this.graphics.beginFill(0x323334);
    this.graphics.drawRoundedRect(1, 1, this.size.width - 2, this.size.height - 2, 5);
  }

  drawX() {
    this.graphics.beginFill(0xffffff);
    this.graphics.drawRoundedRect(1, 1, this.size.width - 2, this.size.height - 2, 5);

    const style = {
      width: 4,
      color: 0xf68310,
      cap: 'round',
    };

    // @ts-ignore
    this.graphics.lineStyle(style)
      .moveTo(this.size.width / 2 - this.size.width / 5.5, this.size.height / 2 - this.size.height / 5.5)
      .lineTo(this.size.width / 2 + this.size.width / 5.5, this.size.height / 2 + this.size.height / 5.5);

    // @ts-ignore
    this.graphics.lineStyle(style)
      .moveTo(this.size.width / 2 + this.size.width / 5.5, this.size.height / 2 - this.size.height / 5.5)
      .lineTo(this.size.width / 2 - this.size.width / 5.5, this.size.height / 2 + this.size.height / 5.5);

    this.graphics.lineStyle();
  }

  clearX() {
    this.clearXTimeline.to({},
      {
        duration: 1,
        onUpdate: function (graphics, width, height) {
          graphics.beginFill(0xffffff, this.ratio);
          graphics.drawRoundedRect(1, 1, width - 2, height - 2, 5);
        },
        onUpdateParams: [this.graphics, this.size.width, this.size.height],
      }, 0);
  }

  drawColor(color) {
    this.colorizeTimeline.to({},
      {
        duration: 1,
        onUpdate: function (graphics, width, height, color) {
          graphics.beginFill(color, this.ratio);
          graphics.drawRoundedRect(1, 1, width - 2, height - 2, 5);
        },
        onUpdateParams: [this.graphics, this.size.width, this.size.height, color],
      }, 0);
  }

  drawFullColor(color) {
    this.fullColorizeTimeline.to({},
      {
        duration: 1,
        onUpdate: function (graphics, width, height, color) {
          graphics.beginFill(color, this.ratio);
          graphics.drawRect(0, 0, width, height);
        },
        onUpdateParams: [this.graphics, this.size.width, this.size.height, color],
      }, 0);
  }
}
