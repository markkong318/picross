import * as PIXI from 'pixi.js';

import {View} from '../../../../framework/view';
import {GameModel} from '../../../model/game-model';
import Event from '../../../../framework/event';
import {
  EVENT_UPDATE_HINT_VIEW, EVENT_UPDATE_ROW_HINT_VIEW_NOT_SOLVED, EVENT_UPDATE_ROW_HINT_VIEW_SOLVED,
} from '../../../env/event';
import Bottle from '../../../../framework/bottle';
import {BLOCK_HEIGHT} from '../../../env/block';
import {HintRowView} from '../../component/board/hint/hint-row-view';

export class HintRowsView extends View {
  private hintRowViews: HintRowView[];
  private gameModel: GameModel;

  constructor() {
    super();
  }

  init() {
    this.gameModel = Bottle.get('gameModel');

    this.hintRowViews = [];

    for (let i = 0; i < this.gameModel.puzzleHeight; i++) {
      const hintRowView = new HintRowView();
      hintRowView.position = new PIXI.Point(0, i * BLOCK_HEIGHT);
      hintRowView.init();

      if (i % 2) {
        hintRowView.drawOdd();
      } else {
        hintRowView.drawEven();
      }

      hintRowView.drawHints(this.gameModel.hintRows[i]);

      this.addChild(hintRowView);

      this.hintRowViews.push(hintRowView);
    }

    Event.on(EVENT_UPDATE_HINT_VIEW, (x, y) => this.updateSelect(y));
    Event.on(EVENT_UPDATE_ROW_HINT_VIEW_NOT_SOLVED, (idx) => this.updateNotSolved(idx));
    Event.on(EVENT_UPDATE_ROW_HINT_VIEW_SOLVED, (idx) => this.updateSolved(idx));
  }

  updateSelect(idx) {
    for (let i = 0; i < this.hintRowViews.length; i++) {
      if (i === idx) {
        this.hintRowViews[i].drawSelect();
      } else {
        if (i % 2) {
          this.hintRowViews[i].drawOdd();
        } else {
          this.hintRowViews[i].drawEven();
        }
      }
    }
  }

  updateSolved(idx) {
    this.hintRowViews[idx].drawSolved();
  }

  updateNotSolved(idx) {
    this.hintRowViews[idx].drawNotSolved();
  }
}
