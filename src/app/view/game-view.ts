import * as PIXI from 'pixi.js';

import {View} from "../../framework/view";
import {BoardView} from "./game/board-view";
import {EVENT_FETCH_ANSWER_IMAGE, EVENT_UPDATE_BOARD_VIEW_POSITION} from "../env/event";
import Event from "../../framework/event";
import {DialogView} from "./game/dialog-view";
import {Size} from "../../framework/size";
import Bottle from "../../framework/bottle";
import {BackView} from "./game/back-view";

export class GameView extends View {
  private backView: BackView;
  private boardView: BoardView;
  private clearView: DialogView;

  constructor() {
    super();

    Event.on(EVENT_UPDATE_BOARD_VIEW_POSITION, () => this.resizeBoardView());
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

    this.clearView = new DialogView();
    this.clearView.size = new Size(this.size.width, this.size.height);
    this.clearView.init();
    this.addChild(this.clearView);

    const url = new URL(window.location.href);
    Bottle.set('searchParams', url.searchParams);

    Event.emit(EVENT_FETCH_ANSWER_IMAGE);
  }

  public resizeBoardView() {
    const border = 70;
    const scale = this.size.width / (this.boardView.width + border);

    this.boardView.scale.x = scale;
    this.boardView.scale.y = scale;

    this.boardView.position = new PIXI.Point(
      (this.size.width - this.boardView.width) / 2,
      (this.size.height - this.boardView.height) / 2
    );
  }
}
