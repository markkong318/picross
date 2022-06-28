import * as PIXI from 'pixi.js';
import gsap from 'gsap';

import {View} from '../../../../framework/view';
import Bottle from '../../../../framework/bottle';
import {BLOCK_HEIGHT, BLOCK_WIDTH} from '../../../env/block';
import {PuzzlesView} from '../board/puzzles-view';
import Event from '../../../../framework/event';
import {
  EVENT_INIT_PUZZLES_VIEW,
  EVENT_PLAY_CLEAN_HEAD_UP_DISPLAY,
} from '../../../env/event';
import {GameModel} from '../../../model/game-model';

export class AuxLineHudView extends View {
  private puzzlesView: PuzzlesView;
  private gameModel: GameModel;

  private sprites: PIXI.Sprite[] = [];

  private clearTimeline: gsap.core.Timeline;

  init() {
    this.puzzlesView = Bottle.get('puzzlesView');
    this.gameModel = Bottle.get('gameModel');

    Event.on(EVENT_INIT_PUZZLES_VIEW, () => {
      this.initLines();
    });

    Event.on(EVENT_PLAY_CLEAN_HEAD_UP_DISPLAY, () => {
      this.playClearLines();
    });

    this.clearTimeline = gsap.timeline();
  }

  initLines() {
    const puzzlesTexture = Bottle.get('puzzlesTexture');

    const puzzleWidth = this.gameModel.puzzleWidth;
    const puzzleHeight = this.gameModel.puzzleHeight;

    for (let i = 1; i < puzzleWidth; i++) {
      if (i % 5) {
        continue;
      }

      const color = (i / 5) % 2 ? 0x00ff00 : 0xff00ff;

      const sprite = new PIXI.Sprite(puzzlesTexture.auxLineTexture);
      sprite.width = 2;
      sprite.height = BLOCK_HEIGHT * puzzleHeight;
      sprite.x = this.puzzlesView.x + BLOCK_WIDTH * i - 1;
      sprite.y = this.puzzlesView.y;
      sprite.tint = color;
      this.addChild(sprite);

      this.sprites.push(sprite);
    }

    for (let i = 1; i < puzzleHeight; i++) {
      if (i % 5) {
        continue;
      }

      const color = (i / 5) % 2 ? 0x00ff00 : 0xff00ff;

      const sprite = new PIXI.Sprite(puzzlesTexture.auxLineTexture);
      sprite.width = BLOCK_WIDTH * puzzleWidth;
      sprite.height = 2;
      sprite.x = this.puzzlesView.x;
      sprite.y = this.puzzlesView.y + BLOCK_HEIGHT * i - 1;
      sprite.tint = color;
      this.addChild(sprite);

      this.sprites.push(sprite);
    }
  }

  playClearLines() {
    for (let i = 0; i < this.sprites.length; i++) {
      this.clearTimeline
        .to(this.sprites[i], {
          duration: 1,
          pixi: {
            alpha: 0,
          },
        }, 0);
    }
  }
}
