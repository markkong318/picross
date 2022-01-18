import * as PIXI from 'pixi.js';

import {Size} from '../../framework/size';
import Bottle from '../../framework/bottle';

export class PuzzlesTexture {
  public size = new Size(32, 32);

  private renderer: PIXI.Renderer;

  public auxLineTexture: PIXI.RenderTexture;
  public lockTexture: PIXI.RenderTexture;

  constructor() {
  }

  init() {
    console.log(Bottle);
    this.renderer = <PIXI.Renderer>Bottle.get('renderer');

    this.initAuxLine();
    this.initLock();
  }

  initAuxLine() {
    const graphics = new PIXI.Graphics();

    graphics.beginFill(0xffffff);
    graphics.drawRect(0, 0, 1, 1);

    this.auxLineTexture = this.renderer.generateTexture(graphics, PIXI.SCALE_MODES.LINEAR, 2);
  }

  initLock() {
    const graphics = new PIXI.Graphics();

    graphics.lineStyle(4, 0xffffff);
    graphics.drawRoundedRect(0, 0, 32, 32, 5);

    this.lockTexture = this.renderer.generateTexture(graphics, PIXI.SCALE_MODES.LINEAR, 2);
  }
}
