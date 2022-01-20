import * as PIXI from 'pixi.js';

import {View} from '../../../../../framework/view';
import {Size} from '../../../../../framework/size';
import {HintView} from './hint-view';
import {BLOCK_HEIGHT} from '../../../../env/block';
import Bottle from '../../../../../framework/bottle';
import gsap from 'gsap';

export class HintRowView extends View {
  private hintViews: HintView[];

  public size = new Size(150, BLOCK_HEIGHT);

  private oddTexture: PIXI.RenderTexture;
  private eventTexture: PIXI.RenderTexture;
  private selectTexture: PIXI.RenderTexture;

  private sprite: PIXI.Sprite;
  private selectedSprite: PIXI.Sprite;

  private animeTimeline: gsap.core.Timeline;

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

    this.selectedSprite = new PIXI.Sprite(this.selectTexture);
    this.addChild(this.selectedSprite);

    this.animeTimeline = gsap.timeline();
    this.animeTimeline
      .to(this.selectedSprite, {
        duration: 1,
        pixi: {
          alpha: 0.6,
        },
        repeat: -1,
        yoyo: true,
      }, 0);
  }

  drawOdd() {
    this.selectedSprite.visible = false;
    this.sprite.texture = this.oddTexture;
  }

  drawEven() {
    this.selectedSprite.visible = false;
    this.sprite.texture = this.eventTexture;
  }

  drawSelect() {
    this.sprite.visible = false;
    this.selectedSprite.visible = true;
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

  drawSolved() {
    for (let i = 0; i < this.hintViews.length; i++) {
      this.hintViews[i].drawSolved();
    }
  }

  drawNotSolved() {
    for (let i = 0; i < this.hintViews.length; i++) {
      this.hintViews[i].drawNotSolved();
    }
  }
}
