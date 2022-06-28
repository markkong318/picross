import * as PIXI from 'pixi.js';
import gsap from 'gsap';

import {View} from '../../../framework/view';
import {PuzzlesView} from './board/puzzles-view';
import Bottle from '../../../framework/bottle';
import Event from '../../../framework/event';
import {
  EVENT_COMPLETE_PUZZLE,
  EVENT_PLAY_CLEAR,
  EVENT_PLAY_CLEAR_X,
  EVENT_PLAY_RESULT,
  EVENT_PLAY_COLORIZE,
  EVENT_PLAY_CLEAN_BACKGROUND,
  EVENT_PLAY_FULL_COLORIZE,
  EVENT_REMOVE_TOUCH_PUZZLE,
  EVENT_INIT_TOUCH_PUZZLE,
  EVENT_STOP_TIMER,
  EVENT_START_PUZZLE,
  EVENT_PLAY_START,
  EVENT_START_TIMER,
  EVENT_INIT_PINCH,
  EVENT_REMOVE_PINCH,
  EVENT_RESIZE_BOARD_VIEW,
  EVENT_PLAY_CLEAN_HEAD_UP_DISPLAY,
  EVENT_PLAY_TRANSITION
} from '../../env/event';
import {BoardView} from './board-view';
import {GameModel} from '../../model/game-model';

export class DialogView extends View {
  private backgroundSprite: PIXI.Sprite;

  private transitionSprite: PIXI.Sprite;

  private startSprite: PIXI.Sprite;
  private startText: PIXI.Text;

  private clearSprite: PIXI.Sprite;
  private clearText: PIXI.Text;

  private resultSprite: PIXI.Sprite;
  private resultText: PIXI.Text;

  private gameModel: GameModel;

  private puzzlesView: PuzzlesView;
  private boardView: BoardView;

  private timeline: gsap.core.Timeline;
  private renderer;

  constructor() {
    super();
  }

  init() {
    this.backgroundSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
    this.backgroundSprite.width = this.size.width;
    this.backgroundSprite.height = this.size.height;
    this.addChild(this.backgroundSprite);

    this.transitionSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.transitionSprite.width = this.size.width;
    this.transitionSprite.height = this.size.height;
    this.transitionSprite.alpha = 0;
    this.addChild(this.transitionSprite);

    this.timeline = gsap.timeline();
    this.renderer = Bottle.get('renderer');
    this.gameModel = Bottle.get('gameModel');

    Event.on(EVENT_START_PUZZLE, () => {
      setTimeout(() => {
        Event.emit(EVENT_PLAY_START);
      }, 1000);
    });

    Event.on(EVENT_COMPLETE_PUZZLE, () => {
      Event.emit(EVENT_STOP_TIMER);
      Event.emit(EVENT_REMOVE_TOUCH_PUZZLE);
      Event.emit(EVENT_REMOVE_PINCH);

      setTimeout(() => {
        Event.emit(EVENT_PLAY_TRANSITION);
      }, 500);
    });
    Event.on(EVENT_PLAY_START, () => this.drawStart());
    Event.on(EVENT_PLAY_TRANSITION, () => this.drawTransition())
    Event.on(EVENT_PLAY_CLEAR, () => this.drawClear());
    Event.on(EVENT_PLAY_RESULT, () => this.drawResult());
  }

  drawTransition() {
    this.boardView = Bottle.get('boardView');

    const playNext = () => {
      Event.emit(EVENT_PLAY_CLEAR);
      Event.emit(EVENT_PLAY_CLEAN_BACKGROUND);
    }

    if (!this.boardView.isMoved() && !this.boardView.isScaled()) {
      playNext();
      return;
    }

    this.timeline.clear().restart();

    this.timeline
      .to(this.transitionSprite, {
        duration: 1,
        pixi: {
          alpha: 1,
        },
        onComplete: function() {
          Event.emit(EVENT_RESIZE_BOARD_VIEW);
        },
      }, 0)
      .to(this.transitionSprite, {
        duration: 1,
        pixi: {
          alpha: 0,
        },
        onComplete: function() {
          playNext();
        }
      }, 1);
  }

  drawStart() {
    this.timeline.clear().restart();

    const backgroundHeight = 150;
    const lineHeight = 6;

    const startGraphics = new PIXI.Graphics();

    startGraphics.beginFill(0x000000);
    startGraphics.drawRect(
      0,
      (this.size.height - backgroundHeight) / 2,
      this.size.width,
      backgroundHeight,
    );

    startGraphics.beginFill(0x666666);
    startGraphics.drawRect(
      0,
      (this.size.height - backgroundHeight) / 2 + 10,
      this.size.width,
      lineHeight,
    );

    startGraphics.drawRect(
      0,
      (this.size.height + backgroundHeight) / 2 - 10 - lineHeight,
      this.size.width,
      lineHeight,
    );

    const texture = this.renderer.generateTexture(startGraphics, PIXI.SCALE_MODES.LINEAR);
    this.startSprite = new PIXI.Sprite(texture);
    this.startSprite.anchor.x = 0.5;
    this.startSprite.anchor.y = 0.5;
    this.startSprite.x = this.size.width / 2;
    this.startSprite.y = this.size.height / 2;
    this.addChild(this.startSprite);

    this.startText = new PIXI.Text('START', {
      fontFamily: 'lato',
      fill: ['#ffffff'],
      fontSize: 30,
      letterSpacing: 50,
    });

    this.startText.anchor.x = 0.5;
    this.startText.anchor.y = 0.5;
    this.startText.x = this.size.width / 2;
    this.startText.y = this.size.height / 2;
    this.addChild(this.startText)

    this.timeline
      .from(this.startText, {
        duration: 0.7,
        ease: 'back.out(1.7)',
        pixi: {
          scaleX: this.startText.scale.x * 2,
          scaleY: this.startText.scale.y * 2,
        },
      }, 0)
      .to(this.startText, {
        duration: 0.5,
        pixi: {
          scaleY: 0,
          alpha: 0,
        },
      }, 1);

    this.timeline
      .from(this.startSprite, {
        duration: 0.7,
        pixi: {
          scaleX: this.startSprite.scale.x * 2,
          scaleY: this.startSprite.scale.y * 2,
        },
      }, 0)
      .to(this.startSprite, {
        duration: 0.5,
        pixi: {
          scaleY: 0,
          alpha: 0,
        },
      }, 1);

    this.timeline
      .to({}, {
        onComplete: function () {
          Event.emit(EVENT_INIT_TOUCH_PUZZLE);
          Event.emit(EVENT_INIT_PINCH);
          Event.emit(EVENT_START_TIMER);
        },
      }, 1);
  }

  drawClear() {
    this.timeline.clear().restart();

    const backgroundHeight = 150;
    const lineHeight = 6;

    const clearGraphics = new PIXI.Graphics();

    clearGraphics.beginFill(0x000000);
    clearGraphics.drawRect(
      0,
      (this.size.height - backgroundHeight) / 2,
      this.size.width,
      backgroundHeight,
    );

    clearGraphics.beginFill(0x666666);
    clearGraphics.drawRect(
      0,
      (this.size.height - backgroundHeight) / 2 + 10,
      this.size.width,
      lineHeight,
    );

    clearGraphics.drawRect(
      0,
      (this.size.height + backgroundHeight) / 2 - 10 - lineHeight,
      this.size.width,
      lineHeight,
    );

    const texture = this.renderer.generateTexture(clearGraphics, PIXI.SCALE_MODES.LINEAR);
    this.clearSprite = new PIXI.Sprite(texture);
    this.clearSprite.anchor.x = 0.5;
    this.clearSprite.anchor.y = 0.5;
    this.clearSprite.x = this.size.width / 2;
    this.clearSprite.y = this.size.height / 2;
    this.addChild(this.clearSprite);

    this.clearText = new PIXI.Text('CLEAR!', {
      fontFamily: 'lato',
      fill: ['#ffffff'],
      fontSize: 30,
      letterSpacing: 50,
    });

    this.clearText.anchor.x = 0.5;
    this.clearText.anchor.y = 0.5;
    this.clearText.x = this.size.width / 2;
    this.clearText.y = this.size.height / 2;
    this.addChild(this.clearText)

    this.timeline
      .from(this.clearText, {
        duration: 0.7,
        ease: 'back.out(1.7)',
        pixi: {
          scaleX: this.clearText.scale.x * 2,
          scaleY: this.clearText.scale.y * 2,
        },
      }, 0)
      .to(this.clearText, {
        duration: 0.5,
        pixi: {
          scaleY: 0,
          alpha: 0,
        },
      }, 1);

    this.timeline
      .from(this.clearSprite, {
        duration: 0.7,
        pixi: {
          scaleX: this.clearSprite.scale.x * 2,
          scaleY: this.clearSprite.scale.y * 2,
        },
      }, 0)
      .to(this.clearSprite, {
        duration: 0.5,
        pixi: {
          scaleY: 0,
          alpha: 0,
        },
      }, 1);

    this.timeline
      .to({}, {
        onComplete: function () {
          Event.emit(EVENT_PLAY_CLEAR_X);
        },
      }, 1);

    this.timeline
      .to({}, {
        onComplete: function () {
          Event.emit(EVENT_PLAY_RESULT)
        },
      }, 1.5);
  }

  drawResult() {
    this.timeline.clear().restart();

    this.puzzlesView = Bottle.get('puzzlesView');

    const startPoint = this.toLocal(
      this.puzzlesView.parent.toGlobal(
        new PIXI.Point(
          this.puzzlesView.x,
          this.puzzlesView.y,
        )
      )
    );

    const endPoint = this.toLocal(
      this.puzzlesView.parent.toGlobal(
        new PIXI.Point(
          this.puzzlesView.x + this.puzzlesView.width,
          this.puzzlesView.y + this.puzzlesView.height,
        )
      )
    );

    this.addChild(this.puzzlesView);

    this.puzzlesView.position = startPoint;
    this.puzzlesView.width = endPoint.x - startPoint.x;
    this.puzzlesView.height = endPoint.y - startPoint.y;

    this.boardView = Bottle.get('boardView');

    this.timeline
      .to(this.boardView, {
        duration: 1,
        pixi: {
          alpha: 0,
        },
      }, 0);

    Event.emit(EVENT_PLAY_CLEAN_HEAD_UP_DISPLAY);

    this.timeline
      .to(this.puzzlesView, {
        duration: 1,
        pixi: {
          x: (this.size.width - this.puzzlesView.width) / 2,
          y: (this.size.height - this.puzzlesView.height) / 2,
        },
        onComplete: function () {
          Event.emit(EVENT_PLAY_COLORIZE);
        },
      }, 1);

    this.timeline
      .to(this.puzzlesView, {
        duration: 1,
        pixi: {
          x: (this.size.width - this.puzzlesView.width) / 2,
          y: (this.size.height - this.puzzlesView.height) / 2 - 100,
        },
        onComplete: () => {
          Event.emit(EVENT_PLAY_FULL_COLORIZE);

          this.resultSprite.y = this.puzzlesView.y + this.puzzlesView.height + 60;
          this.resultText.y = this.puzzlesView.y + this.puzzlesView.height + 60;
        }
      }, 3);

    const resultGraphics = new PIXI.Graphics();
    resultGraphics.beginFill(0x000000);
    resultGraphics.drawRect(
      0,
      this.puzzlesView.y + this.puzzlesView.height + 20,
      this.size.width,
      60,
    );

    const texture = this.renderer.generateTexture(resultGraphics);
    this.resultSprite = new PIXI.Sprite(texture);
    this.resultSprite.anchor.x = 0.5;
    this.resultSprite.anchor.y = 0.5;
    this.resultSprite.x = this.size.width / 2;
    this.addChild(this.resultSprite);

    this.timeline
      .from(this.resultSprite, {
        duration: 0.5,
        pixi: {
          scaleY: 0,
        },
      }, 4);

    const timer = this.gameModel.timer;
    const hour = Math.floor(timer / (60 * 60));
    const min = Math.floor(timer % (60 * 60) / 60);
    const sec = timer % 60;

    const timeText = `${('00' + hour).slice(-2)}:${('00' + min).slice(-2)}:${('00' + sec).slice(-2)}`

    const searchParams = Bottle.get('searchParams');
    const title = searchParams.get('title') || 'Warrior';

    this.resultText = new PIXI.Text(`${timeText}\n${title}`, {
      fontFamily: 'lato',
      fill: ['#ffffff'],
      fontSize: 22,
      letterSpacing: 10,
      align: 'center',
    });

    this.resultText.anchor.x = 0.5;
    this.resultText.anchor.y = 0.5;
    this.resultText.x = this.size.width / 2;
    this.addChild(this.resultText)

    this.timeline
      .from(this.resultText, {
        duration: 0.5,
        pixi: {
          alpha: 0,
        },
      }, 4.5);
  }
}
