import * as PIXI from 'pixi.js';

import {View} from '../../framework/view';
import {BoardView} from './game/board-view';
import {EVENT_FETCH_ANSWER_IMAGE, EVENT_RESIZE_BOARD_VIEW} from '../env/event';
import Event from '../../framework/event';
import {DialogView} from './game/dialog-view';
import {Size} from '../../framework/size';
import Bottle from '../../framework/bottle';
import {BackView} from './game/back-view';
import {PinchView} from './game/pinch-view';

export class GameView extends View {
  private backView: BackView;
  private boardView: BoardView;
  private clearView: DialogView;
  private pinchView: PinchView;

  constructor() {
    super();
  }

  public init() {
    const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
    bg.width = this.size.width;
    bg.height = this.size.height;
    bg.tint = 0x333333;
    this.addChild(bg);

    this.backView = new BackView();
    this.backView.size = new Size(this.size.width, this.size.height);
    this.backView.init();
    this.addChild(this.backView);

    this.boardView = new BoardView();
    this.boardView.init();
    this.addChild(this.boardView);
    Bottle.set('boardView', this.boardView);

    this.pinchView = new PinchView();
    this.pinchView.size = new Size(this.size.width, this.size.height);
    this.pinchView.init();
    this.addChild(this.pinchView);
    Bottle.set('pinchView', this.boardView);

    this.clearView = new DialogView();
    this.clearView.size = new Size(this.size.width, this.size.height);
    this.clearView.init();
    this.addChild(this.clearView);

    const url = new URL(window.location.href);
    Bottle.set('searchParams', url.searchParams);

    Event.emit(EVENT_FETCH_ANSWER_IMAGE);
  }
}
