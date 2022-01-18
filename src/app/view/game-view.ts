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
import {PuzzleTexture} from '../texture/puzzle-texture';
import {HintColumnTexture} from '../texture/hint-column-texture';
import {HintRowTexture} from '../texture/hint-row-texture';
import {PuzzlesTexture} from '../texture/puzzles-texture';

export class GameView extends View {
  private background: PIXI.Sprite;

  private puzzleTexture: PuzzleTexture;
  private puzzlesTexture: PuzzlesTexture;
  private hintColumnTexture: HintColumnTexture;
  private hintRowTexture: HintRowTexture;

  private backView: BackView;
  private boardView: BoardView;
  private clearView: DialogView;
  private pinchView: PinchView;

  constructor() {
    super();
  }

  public init() {
    this.background = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.background.width = this.size.width;
    this.background.height = this.size.height;
    this.background.tint = 0x333333;
    this.addChild(this.background);

    this.puzzleTexture = new PuzzleTexture();
    this.puzzleTexture.init();
    Bottle.set('puzzleTexture', this.puzzleTexture);

    this.puzzlesTexture = new PuzzlesTexture();
    this.puzzlesTexture.init();
    Bottle.set('puzzlesTexture', this.puzzlesTexture);

    this.hintColumnTexture = new HintColumnTexture();
    this.hintColumnTexture.init();
    Bottle.set('hintColumnTexture', this.hintColumnTexture);

    this.hintRowTexture = new HintRowTexture();
    this.hintRowTexture.init();
    Bottle.set('hintRowTexture', this.hintRowTexture);

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
