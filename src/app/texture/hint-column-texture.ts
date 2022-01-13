import * as PIXI from 'pixi.js';
import Bottle from '../../framework/bottle';
import {Size} from '../../framework/size';
import {BLOCK_WIDTH} from '../env/block';

export class HintColumnTexture {
  private renderer: PIXI.Renderer;

  public size = new Size(BLOCK_WIDTH, 150);

  private radius: number = 10;
  private puzzleOffset: number = 10;

  private oddTexture: PIXI.RenderTexture;
  private eventTexture: PIXI.RenderTexture;
  private selectTexture: PIXI.RenderTexture;

  init() {
    console.log(Bottle);
    this.renderer = <PIXI.Renderer>Bottle.get('renderer');
    this.initOddTexture();
    this.initEventTexture();
    this.initSelectTexture();
  }

  initOddTexture() {
    const graphics = new PIXI.Graphics();

    graphics.beginFill(0xffffff);
    graphics.drawRoundedRect(0, 0, this.size.width, this.size.height + this.radius + this.puzzleOffset, this.radius);

    this.oddTexture = this.renderer.generateTexture(graphics, PIXI.SCALE_MODES.LINEAR, 2);
  }

  initEventTexture() {
    const graphics = new PIXI.Graphics();

    graphics.beginFill(0xf1f2f3);
    graphics.drawRoundedRect(0, 0, this.size.width, this.size.height + this.radius + this.puzzleOffset, this.radius);

    this.eventTexture = this.renderer.generateTexture(graphics, PIXI.SCALE_MODES.LINEAR, 2);
  }

  initSelectTexture() {
    const graphics = new PIXI.Graphics();

    graphics.beginFill(0x45d4ff);
    graphics.drawRoundedRect(0, 0, this.size.width, this.size.height + this.radius + this.puzzleOffset, this.radius);

    this.selectTexture = this.renderer.generateTexture(graphics, PIXI.SCALE_MODES.LINEAR, 2);
  }
}
