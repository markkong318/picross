import * as PIXI from 'pixi.js';

import {View} from '../../../../framework/view';
import {GameModel} from '../../../model/game-model';
import Event from '../../../../framework/event';
import {
  EVENT_UPDATE_COLUMN_HINT_VIEW_NOT_SOLVED, EVENT_UPDATE_COLUMN_HINT_VIEW_SOLVED,
  EVENT_UPDATE_HINT_VIEW, EVENT_UPDATE_ROW_HINT_VIEW_NOT_SOLVED, EVENT_UPDATE_ROW_HINT_VIEW_SOLVED,
} from '../../../env/event';
import Bottle from '../../../../framework/bottle';
import {BLOCK_WIDTH} from '../../../env/block';
import {HintColumnView} from '../../component/board/hint/hint-column-view';

export class HintColumnsView extends View {
  private hintColumnViews: HintColumnView[];
  private gameModel: GameModel;

  constructor() {
    super();
  }

  init() {
    this.gameModel = Bottle.get('gameModel');

    this.hintColumnViews = [];

    for (let i = 0; i < this.gameModel.puzzleWidth; i++) {
      const hintColumnView = new HintColumnView();
      hintColumnView.position = new PIXI.Point(i * BLOCK_WIDTH, 0);
      hintColumnView.init();

      if (i % 2) {
        hintColumnView.drawOdd();
      } else {
        hintColumnView.drawEven();
      }

      hintColumnView.drawHints(this.gameModel.hintColumns[i]);

      this.addChild(hintColumnView);

      this.hintColumnViews.push(hintColumnView);
    }

    Event.on(EVENT_UPDATE_HINT_VIEW, (x, y) => this.updateSelect(x));
    Event.on(EVENT_UPDATE_COLUMN_HINT_VIEW_NOT_SOLVED, (idx) => this.updateNotSolved(idx));
    Event.on(EVENT_UPDATE_COLUMN_HINT_VIEW_SOLVED, (idx) => this.updateSolved(idx));
  }

  updateSelect(idx) {
    for (let i = 0; i < this.hintColumnViews.length; i++) {
      if (i === idx) {
        this.hintColumnViews[i].drawSelect();
      } else {
        if (i % 2) {
          this.hintColumnViews[i].drawOdd();
        } else {
          this.hintColumnViews[i].drawEven();
        }
      }
    }
  }

  updateSolved(idx) {
    this.hintColumnViews[idx].drawSolved();
  }

  updateNotSolved(idx) {
    this.hintColumnViews[idx].drawNotSolved();
  }
}
