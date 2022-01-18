import * as PIXI from 'pixi.js';
import gsap from 'gsap';

import {View} from '../../../../framework/view';
import {PuzzleView} from '../../component/board/puzzle/puzzle-view';
import {BLOCK_BLACK, BLOCK_WHITE, BLOCK_X} from '../../../env/block';
import {GameModel} from '../../../model/game-model';
import Event from '../../../../framework/event';
import {
  EVENT_END_TOUCH_PUZZLE,
  EVENT_INIT_PUZZLES_VIEW,
  EVENT_PLAY_CLEAR_X,
  EVENT_START_TOUCH_PUZZLE,
  EVENT_UPDATE_PUZZLE_VIEW,
  EVENT_PLAY_COLORIZE,
  EVENT_START_PUZZLE,
  EVENT_PLAY_FULL_COLORIZE,
  EVENT_REMOVE_TOUCH_PUZZLE,
  EVENT_INIT_TOUCH_PUZZLE, EVENT_SAVE_PUZZLE, EVENT_PLAT_CLEAN_HEAD_UP_DISPLAY, EVENT_UPDATE_LOCK
} from '../../../env/event';
import Bottle from '../../../../framework/bottle';
import {BLOCK_HEIGHT, BLOCK_WIDTH} from '../../../env/block';
import {PuzzlesTexture} from '../../../texture/puzzles-texture';

export class PuzzlesView extends View {
  private renderer: PIXI.Renderer;

  private puzzleViews: PuzzleView[][];
  private backgroundSprite: PIXI.Sprite;
  private gameModel: GameModel;

  private posX: number;
  private posY: number;

  private clearXTimeline: gsap.core.Timeline;
  private colorizeTimeline: gsap.core.Timeline;
  private fullColorizeTimeline: gsap.core.Timeline;

  private clearHeadUpDisplayTimeline: gsap.core.Timeline;

  private isTouched: boolean = false;

  private auxLineSprites = [];
  private lockSprite: PIXI.Sprite;
  private floatLockSprite: PIXI.Sprite;

  private floatLockTimeline: gsap.core.Timeline;

  constructor() {
    super();
  }

  init() {
    this.renderer = <PIXI.Renderer>Bottle.get('renderer');
    this.gameModel = <GameModel>Bottle.get('gameModel');

    this.clearHeadUpDisplayTimeline = gsap.timeline();

    this.clearXTimeline = gsap.timeline();
    Bottle.set('clearXTimeline', this.clearXTimeline);

    this.colorizeTimeline = gsap.timeline();
    Bottle.set('colorizeTimeline', this.colorizeTimeline);

    this.fullColorizeTimeline = gsap.timeline();
    Bottle.set('fullColorizeTimeline', this.fullColorizeTimeline);

    Event.on(EVENT_INIT_PUZZLES_VIEW, () => {
      this.initPuzzlesView();
      this.initAuxLines();
      this.initLock();
      this.updatePuzzlesView();
      Event.emit(EVENT_START_PUZZLE);
    });

    Event.on(EVENT_UPDATE_PUZZLE_VIEW, (x, y) => this.updatePuzzleView(x, y));
    Event.on(EVENT_PLAY_COLORIZE, () => this.playColorize());
    Event.on(EVENT_PLAY_FULL_COLORIZE, () => this.playFullColorize());
    Event.on(EVENT_PLAY_CLEAR_X, () => this.playClearX());
    Event.on(EVENT_PLAT_CLEAN_HEAD_UP_DISPLAY, () => {
      this.playClearAuxLines();
      this.playClearLock();
    });

    Event.on(EVENT_INIT_TOUCH_PUZZLE, () => this.initTouchEvent());
    Event.on(EVENT_REMOVE_TOUCH_PUZZLE, () => this.removeTouchEvent());

    Event.on(EVENT_UPDATE_LOCK, (x, y) => this.setUpdatePosition(x, y));
  }

  initTouchEvent() {
    this.on('hammer-panstart', (event) => {
      if (event.maxPointers > 1) {
        return;
      }

      this.isTouched = true;

      const {x, y} = this.toLocal(event.center);
      const {posX, posY} = this.getTouchPosition(x, y);
      if (posX === undefined || posY === undefined) {
        return;
      }

      this.touchStart(posX, posY);
    });

    this.on('hammer-pan', (event) => {
      if (event.maxPointers > 1) {
        return;
      }
      if (!this.isTouched) {
        return;
      }

      const {x, y} = this.toLocal(event.center);
      const {posX, posY} = this.getTouchPosition(x, y);
      if (posX === undefined || posY === undefined) {
        return;
      }

      this.touchStart(posX, posY);
    });

    this.on('hammer-panend', (event) => {
      if (event.maxPointers > 1) {
        return;
      }
      if (!this.isTouched) {
        return;
      }

      const {x, y} = this.toLocal(event.center);
      const {posX, posY} = this.getTouchPosition(x, y);
      if (posX === undefined || posY === undefined) {
        return;
      }

      this.touchEnd(posX, posY);

      this.isTouched = false;

      Event.emit(EVENT_SAVE_PUZZLE);
    });

    this.on('hammer-tap', (event) => {
      const {x, y} = this.toLocal(event.center);
      const {posX, posY} = this.getTouchPosition(x, y);
      if (posX === undefined || posY === undefined) {
        return;
      }

      this.touchStart(posX, posY);
      this.touchEnd(posX, posY);

      Event.emit(EVENT_SAVE_PUZZLE);
    });
  }

  removeTouchEvent() {
    this.off('hammer-panstart');
    this.off('hammer-pan');
    this.off('hammer-panend');
    this.off('hammer-tap');
  }

  initPuzzlesView() {
    const puzzleWidth = this.gameModel.puzzleWidth;
    const puzzleHeight = this.gameModel.puzzleHeight;

    this.interactive = true;

    const backgroundGraphics = new PIXI.Graphics();
    backgroundGraphics.beginFill(0x656566);
    backgroundGraphics.drawRoundedRect(0, 0, BLOCK_WIDTH * puzzleWidth, BLOCK_HEIGHT * puzzleHeight, 5);

    this.backgroundSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
    this.backgroundSprite.texture = this.renderer.generateTexture(backgroundGraphics, PIXI.SCALE_MODES.LINEAR, 2);
    this.backgroundSprite.position = new PIXI.Point(-1, -1)
    this.addChild(this.backgroundSprite);

    this.puzzleViews = new Array(puzzleWidth);

    for (let i = 0; i < this.puzzleViews.length; i++) {
      this.puzzleViews[i] = new Array(puzzleHeight);
    }

    for (let i = 0; i < this.puzzleViews.length; i++) {
      for (let j = 0; j < this.puzzleViews[i].length; j++) {
        this.puzzleViews[i][j] = new PuzzleView(i, j);
        this.puzzleViews[i][j].position = new PIXI.Point(j * this.puzzleViews[i][j].size.height, i * this.puzzleViews[i][j].size.width);
        this.puzzleViews[i][j].init();
        this.puzzleViews[i][j].drawWhite();

        this.addChild(this.puzzleViews[i][j]);
      }
    }
  }

  updatePuzzleView(x, y) {
    const puzzle = this.gameModel.puzzle;

    switch (puzzle[x][y]) {
      case BLOCK_WHITE:
        this.puzzleViews[x][y].drawWhite();
        break;
      case BLOCK_BLACK:
        this.puzzleViews[x][y].drawBlack();
        break;
      case BLOCK_X:
        this.puzzleViews[x][y].drawX();
        break;
    }
  }

  updatePuzzlesView() {
    for (let i = 0; i < this.puzzleViews.length; i++) {
      for (let j = 0; j < this.puzzleViews[i].length; j++) {
        this.updatePuzzleView(i, j);
      }
    }
  }

  playColorize() {
    const origins = this.gameModel.origins;

    for (let i = 0; i < this.puzzleViews.length; i++) {
      for (let j = 0; j < this.puzzleViews[i].length; j++) {
        this.puzzleViews[i][j].drawColor(origins[i][j]);
      }
    }
  }

  playFullColorize() {
    const origins = this.gameModel.origins;

    for (let i = 0; i < this.puzzleViews.length; i++) {
      for (let j = 0; j < this.puzzleViews[i].length; j++) {
        this.puzzleViews[i][j].drawFullColor(origins[i][j]);
      }
    }
  }

  getTouchPosition(x: number, y: number) {
    const puzzleWidth = this.gameModel.puzzleWidth;
    const puzzleHeight = this.gameModel.puzzleHeight;

    const posX = Math.floor(x / BLOCK_WIDTH);
    const posY = Math.floor(y / BLOCK_HEIGHT);

    if (posX < 0 || posX >= puzzleWidth || posY < 0 || posY >= puzzleHeight) {
      console.log('touch not on puzzle')
      return {};
    }

    return {
      posX,
      posY,
    };
  }

  playClearX() {
    const puzzle = this.gameModel.puzzle;

    for (let i = 0; i < this.puzzleViews.length; i++) {
      for (let j = 0; j < this.puzzleViews[i].length; j++) {
        switch (puzzle[i][j]) {
          case BLOCK_X:
            this.puzzleViews[i][j].clearX();
            break;
        }
      }
    }
  }

  touchStart(posX, posY) {
    if (posX === this.posX && posY === this.posY) {
      return;
    }

    this.posX = posX;
    this.posY = posY;

    Event.emit(EVENT_START_TOUCH_PUZZLE, posY, posX);
    Event.emit(EVENT_UPDATE_LOCK, posX, posY);
  }

  touchEnd(posX, posY) {
    this.posX = -1;
    this.posY = -1;
    Event.emit(EVENT_END_TOUCH_PUZZLE, posY, posX);
    Event.emit(EVENT_UPDATE_LOCK, posX, posY);
  }

  initAuxLines() {
    const puzzlesTexture = <PuzzlesTexture>Bottle.get('puzzlesTexture');

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
      sprite.x = BLOCK_WIDTH * i - 1;
      sprite.y = 0;
      sprite.tint = color;
      this.addChild(sprite);

      this.auxLineSprites.push(sprite);
    }

    for (let i = 1; i < puzzleHeight; i++) {
      if (i % 5) {
        continue;
      }

      const color = (i / 5) % 2 ? 0x00ff00 : 0xff00ff;

      const sprite = new PIXI.Sprite(puzzlesTexture.auxLineTexture);
      sprite.width = BLOCK_WIDTH * puzzleWidth;
      sprite.height = 2;
      sprite.x = 0;
      sprite.y = BLOCK_HEIGHT * i - 1;
      sprite.tint = color;
      this.addChild(sprite);

      this.auxLineSprites.push(sprite);
    }
  }

  playClearAuxLines() {
    for (let i = 0; i < this.auxLineSprites.length; i++) {
      this.clearHeadUpDisplayTimeline
        .to(this.auxLineSprites[i], {
          duration: 1,
          pixi: {
            alpha: 0,
          },
        }, 0);
    }
  }

  initLock() {
    const texture = <PuzzlesTexture>Bottle.get('puzzlesTexture');

    this.lockSprite = new PIXI.Sprite(texture.lockTexture);
    this.lockSprite.alpha = 0;
    this.lockSprite.x = -2;
    this.lockSprite.y = -2;
    this.lockSprite.tint = 0x45d4ff;
    this.addChild(this.lockSprite);

    this.floatLockSprite = new PIXI.Sprite(texture.lockTexture);
    this.floatLockSprite.alpha = 0;
    this.floatLockSprite.x = -2;
    this.floatLockSprite.y = -2;
    this.floatLockSprite.tint = 0x0277fd;
    this.addChild(this.floatLockSprite);

    this.floatLockTimeline = gsap.timeline();
    this.floatLockTimeline.pause();
    this.floatLockTimeline
      .to(this.floatLockSprite, {
        duration: 1,
        pixi: {
          alpha: 0,
        },
        repeat: -1,
        yoyo: true,
      }, 0);

  }

  playClearLock() {
    this.clearHeadUpDisplayTimeline
      .to(this.lockSprite, {
        duration: 1,
        pixi: {
          alpha: 0,
        },
      }, 0);

    this.clearHeadUpDisplayTimeline
      .to(this.floatLockSprite, {
        duration: 1,
        pixi: {
          alpha: 0,
        },
      }, 0);
  }

  setUpdatePosition(posX, posY) {
    this.lockSprite.alpha = 1;
    this.floatLockSprite.alpha = 1;

    if (this.floatLockTimeline.paused()) {
      this.floatLockTimeline.play();
    }

    this.lockSprite.x = posX * BLOCK_WIDTH - 2;
    this.lockSprite.y = posY * BLOCK_HEIGHT - 2;

    this.floatLockSprite.x = posX * BLOCK_WIDTH - 2;
    this.floatLockSprite.y = posY * BLOCK_HEIGHT - 2;
  }
}
