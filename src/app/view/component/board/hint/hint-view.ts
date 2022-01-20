import * as PIXI from 'pixi.js';

import {View} from '../../../../../framework/view';
import {Size} from '../../../../../framework/size';

export class HintView extends View {
  public size = new Size(25, 25);
  private text: PIXI.Text;

  constructor() {
    super();
  }

  public init() {
    const bound = new PIXI.Sprite(PIXI.Texture.EMPTY);
    bound.width = this.size.width;
    bound.height = this.size.height;
    this.addChild(bound);

    this.text = new PIXI.Text('0', {
      fontFamily: 'lato',
      fill: '#373737',
      fontSize: 25,
      fontWeight: 'bold',
    });
    this.text.anchor.x = 0.5;
    this.text.anchor.y = 0.5;
    this.text.x = this.width / 2;
    this.text.y = this.height / 2;
    this.addChild(this.text);
  }

  public setText(text) {
    this.text.text = text;
  }

  public drawSolved() {
    this.text.style.fill = '#a6a6a6';
  }

  public drawNotSolved() {
    this.text.style.fill = '#373737';
  }
}
