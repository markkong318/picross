import * as PIXI from 'pixi.js';

import {Size} from '../../framework/size';
import Bottle from '../../framework/bottle';

export class PuzzleTexture {
  public size = new Size(32, 32);

  private renderer: PIXI.Renderer;

  public backgroundTexture: PIXI.RenderTexture;
  public whiteTexture: PIXI.RenderTexture;
  public blackTexture: PIXI.RenderTexture;
  public xTexture: PIXI.RenderTexture;
  public fullTexture: PIXI.RenderTexture;

  constructor() {
  }

  init() {
    console.log(Bottle);
    this.renderer = <PIXI.Renderer>Bottle.get('renderer');

    this.initBackgroundTexture();
    this.initWhiteTexture();
    this.initBlackTexture();
    this.initXTexture();
    this.initFullTexture();
  }

  initBackgroundTexture() {
    const graphics = new PIXI.Graphics();

    graphics.beginFill(0x323334);
    graphics.drawRoundedRect(1, 1, this.size.width - 2, this.size.height - 2, 5);

    this.backgroundTexture = this.renderer.generateTexture(graphics, PIXI.SCALE_MODES.LINEAR, 2);
  }

  initWhiteTexture() {
    const graphics = new PIXI.Graphics();

    graphics.beginFill(0xffffff);
    graphics.drawRoundedRect(1, 1, this.size.width - 2, this.size.height - 2, 5);

    this.whiteTexture = this.renderer.generateTexture(graphics, PIXI.SCALE_MODES.LINEAR, 2);
  }

  initBlackTexture() {
    const graphics = new PIXI.Graphics();

    graphics.beginFill(0x323334);
    graphics.drawRoundedRect(1, 1, this.size.width - 2, this.size.height - 2, 5);

    this.blackTexture = this.renderer.generateTexture(graphics, PIXI.SCALE_MODES.LINEAR, 2);
  }

  initXTexture() {
    const graphics = new PIXI.Graphics();

    graphics.beginFill(0xffffff);
    graphics.drawRoundedRect(1, 1, this.size.width - 2, this.size.height - 2, 5);

    const style = {
      width: 4,
      color: 0xf68310,
      cap: 'round',
    };

    // @ts-ignore
    graphics.lineStyle(style)
      .moveTo(this.size.width / 2 - this.size.width / 5.5, this.size.height / 2 - this.size.height / 5.5)
      .lineTo(this.size.width / 2 + this.size.width / 5.5, this.size.height / 2 + this.size.height / 5.5);

    // @ts-ignore
    graphics.lineStyle(style)
      .moveTo(this.size.width / 2 + this.size.width / 5.5, this.size.height / 2 - this.size.height / 5.5)
      .lineTo(this.size.width / 2 - this.size.width / 5.5, this.size.height / 2 + this.size.height / 5.5);

    graphics.lineStyle();

    this.xTexture = this.renderer.generateTexture(graphics, PIXI.SCALE_MODES.LINEAR, 2);
  }

  initFullTexture() {
    const graphics = new PIXI.Graphics();

    graphics.beginFill(0xffffff);
    graphics.drawRect(0, 0, this.size.width, this.size.height);

    this.fullTexture = this.renderer.generateTexture(graphics, PIXI.SCALE_MODES.LINEAR, 2);
  }
}
