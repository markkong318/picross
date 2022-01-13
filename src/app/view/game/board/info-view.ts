import * as PIXI from 'pixi.js';

import {View} from '../../../../framework/view';
import {Size} from '../../../../framework/size';
import Event from '../../../../framework/event';
import {EVENT_UPDATE_TIMER} from '../../../env/event';
import {GameModel} from '../../../model/game-model';
import Bottle from '../../../../framework/bottle';

export class InfoView extends View {
  private renderer: PIXI.Renderer;
  private gameModel: GameModel;

  private backgroundSprite: PIXI.Sprite;

  public size = new Size(150, 150);
  private titleText: PIXI.Text;
  private timerText: PIXI.Text;

  constructor() {
    super();
  }

  public init() {
    console.log(Bottle);
    this.renderer = <PIXI.Renderer>Bottle.get('renderer');
    this.gameModel = <GameModel>Bottle.get('gameModel');

    const backgroundGraphics = new PIXI.Graphics();

    backgroundGraphics.beginFill(0x323334);
    backgroundGraphics.drawRoundedRect(0, 0, this.size.width, this.size.height, 10);

    backgroundGraphics.beginFill(0x000000);
    backgroundGraphics.drawRoundedRect(5, 5, 135, 17, 10);

    this.backgroundSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
    this.backgroundSprite.texture = this.renderer.generateTexture(backgroundGraphics, PIXI.SCALE_MODES.LINEAR, 2);
    this.addChild(this.backgroundSprite);

    this.titleText = new PIXI.Text('PICROSS', {
      fontFamily: 'lato',
      fill: ['#ffffff'],
      fontSize: 14,
      letterSpacing: 5,
    });
    this.titleText.anchor.x = 0.5;
    this.titleText.anchor.y = 0.5;
    this.titleText.x = this.width / 2;
    this.titleText.y = 13;
    this.addChild(this.titleText)

    this.timerText = new PIXI.Text('00:00:00', {
      fontFamily: 'lato',
      fill: ['#ffffff'],
      fontSize: 30,
      letterSpacing: 3,
    });
    this.timerText.anchor.x = 0.5;
    this.timerText.anchor.y = 0.5;
    this.timerText.x = this.width / 2;
    this.timerText.y = 80;
    this.addChild(this.timerText);

    Event.on(EVENT_UPDATE_TIMER, () => this.updateTimer());
  }

  updateTimer() {
    const timer = this.gameModel.timer;
    const hour = Math.floor(timer / (60 * 60));
    const min = Math.floor(timer % (60 * 60) / 60);
    const sec = timer % 60;

    this.timerText.text = `${('00' + hour).slice(-2)}:${('00' + min).slice(-2)}:${('00' + sec).slice(-2)}`
  }
}
