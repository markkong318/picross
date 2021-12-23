import * as PIXI from 'pixi.js';

import {View} from '../../../framework/view';
import Bottle from '../../../framework/bottle';
import Event from '../../../framework/event';
import {InfoView} from "./board/info-view";
import {
  EVENT_INIT_BOARD_VIEW, EVENT_INIT_PUZZLES_VIEW, EVENT_UPDATE_BOARD_VIEW_POSITION,
} from '../../env/event';
import {GameModel} from '../../model/game-model';
import {PuzzlesView} from './board/puzzles-view';
import {HintColumnsView} from './board/hint-columns-view';
import {HintRowsView} from './board/hint-rows-view';

export class BoardView extends View {
  private backgroundGraphics: PIXI.Graphics;

  private puzzlesView: PuzzlesView;
  private hintColumnsView: HintColumnsView;
  private hintRowsView: HintRowsView;
  private infoView: InfoView;

  private gameModel: GameModel;

  private borderPadding: number = 5;
  private puzzleOffset: number = 10;

  private initScale: number;
  private currentScale: number;
  private currentX: number;
  private currentY: number;

  constructor() {
    super();
  }

  public init() {
    this.gameModel = Bottle.get('gameModel');

    Event.on(EVENT_INIT_BOARD_VIEW, () => {
      this.backgroundGraphics = new PIXI.Graphics();
      this.addChild(this.backgroundGraphics);

      this.hintColumnsView = new HintColumnsView();
      this.hintColumnsView.init();
      this.addChild(this.hintColumnsView);

      this.hintRowsView = new HintRowsView();
      this.hintRowsView.init();
      this.addChild(this.hintRowsView);

      this.puzzlesView = new PuzzlesView();
      this.puzzlesView.init();
      this.addChild(this.puzzlesView);
      Bottle.set('puzzlesView', this.puzzlesView);

      this.infoView = new InfoView();
      this.infoView.init();
      this.addChild(this.infoView)

      this.backgroundGraphics.beginFill(0xffffff);
      this.backgroundGraphics.drawRoundedRect(
        0,
        0,
        this.hintRowsView.width + this.hintColumnsView.width + this.borderPadding * 2,
        this.hintColumnsView.height + this.hintRowsView.height + this.borderPadding * 2,
        8
      );

      this.puzzlesView.position = new PIXI.Point(
        this.borderPadding + this.hintRowsView.width - this.puzzleOffset,
        this.borderPadding + this.hintColumnsView.height - this.puzzleOffset
      );

      this.hintColumnsView.position = new PIXI.Point(
        this.borderPadding + this.hintRowsView.width - this.puzzleOffset,
        this.borderPadding
      );

      this.hintRowsView.position = new PIXI.Point(
        this.borderPadding,
        this.borderPadding + this.hintColumnsView.height - this.puzzleOffset
      );

      this.infoView.position = new PIXI.Point(this.borderPadding, this.borderPadding);

      Event.emit(EVENT_INIT_PUZZLES_VIEW);
      Event.emit(EVENT_UPDATE_BOARD_VIEW_POSITION);
    });

    Event.on(EVENT_UPDATE_BOARD_VIEW_POSITION, () => this.resize());

    this.on('hammer-pinchstart', (e) => this.pinchStart(e));
    this.on('hammer-pinch', (e) => this.pinch(e));
    this.on('hammer-pinchend', (e) => this.pinchEnd(e));
  }

  public resize() {
    const border = 70;
    const scale = (<View>this.parent).size.width / (this.width + border);

    this.scale.x = scale;
    this.scale.y = scale;

    this.position = new PIXI.Point(
      ((<View>this.parent).size.width - this.width) / 2,
      ((<View>this.parent).size.height - this.height) / 2
    );

    this.initScale = scale;
  }

  public pinchStart(e) {
    this.currentScale = this.scale.x;
    this.currentX = this.x;
    this.currentY = this.y;

    this.pivot = this.toLocal(e.center);

    this.x += this.pivot.x * this.scale.x;
    this.y += this.pivot.y * this.scale.y;

    this.currentX = this.x;
    this.currentY = this.y;
  }

  public pinch(e) {
    let scale = this.currentScale * e.scale;

    if (scale > 1) {
      scale = 1;
    }

    if (scale < this.initScale) {
      scale = this.initScale;
    }

    this.scale.x = scale;
    this.scale.y = scale;

    this.x = this.currentX + e.deltaX;
    this.y = this.currentY + e.deltaY;
  }

  public pinchEnd(e) {
    this.x -= this.pivot.x * this.scale.x;
    this.y -= this.pivot.y * this.scale.y;

    this.pivot.x = 0;
    this.pivot.y = 0;
  }
}
