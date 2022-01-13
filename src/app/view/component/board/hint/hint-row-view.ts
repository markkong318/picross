import * as PIXI from 'pixi.js';

import {View} from '../../../../../framework/view';
import {Size} from '../../../../../framework/size';
import {HintView} from './hint-view';
import {BLOCK_HEIGHT} from '../../../../env/block';
import Bottle from '../../../../../framework/bottle';

export class HintRowView extends View {
  private hintViews: HintView[];

  public size = new Size(150, BLOCK_HEIGHT);

  private oddTexture: PIXI.RenderTexture;
  private eventTexture: PIXI.RenderTexture;
  private selectTexture: PIXI.RenderTexture;
  private sprite: PIXI.Sprite;

  constructor() {
    super();
  }

  public init() {
    const hintRowTexture = Bottle.get('hintRowTexture');

    this.oddTexture = hintRowTexture.oddTexture;
    this.eventTexture = hintRowTexture.eventTexture;
    this.selectTexture = hintRowTexture.selectTexture;

    this.sprite = new PIXI.Sprite();
    this.addChild(this.sprite);
  }

  drawOdd() {
    this.sprite.texture = this.oddTexture;
  }

  drawEven() {
    this.sprite.texture = this.eventTexture;
  }

  drawSelect() {
    this.sprite.texture = this.selectTexture;
  }

  drawHints(hits: number[]) {
    this.hintViews = [];

    for (let i = 0; i < hits.length; i++) {
      const hintView = new HintView();
      hintView.init();
      hintView.setText(hits[i]);
      hintView.position = new PIXI.Point(
        this.size.width - hintView.size.width * (hits.length - i),
        (this.size.height - hintView.size.height) / 2,
      );
      this.addChild(hintView);

      this.hintViews.push(hintView);
    }
  }
}
