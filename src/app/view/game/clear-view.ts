import * as PIXI from 'pixi.js';
import gsap from "gsap";

import {View} from "../../../framework/view";
import {PuzzlesView} from "./board/puzzles-view";
import Bottle from "../../../framework/bottle";
import Event from "../../../framework/event";
import {
  EVENT_COMPLETE_PUZZLE,
  EVENT_PLAY_CLEAR, EVENT_PLAY_CLEAR_X,
  EVENT_PLAY_RESULT,
  EVENT_PLAY_COLORIZE, EVENT_PLAY_CLEAN_BACKGROUND, EVENT_PLAY_FULL_COLORIZE
} from "../../env/event";
import {BoardView} from "./board-view";
import {GameModel} from "../../model/game-model";

export class ClearView extends View {
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
    this.timeline = gsap.timeline();
    this.renderer = Bottle.get('renderer');
    this.gameModel = Bottle.get('gameModel');

    Event.on(EVENT_COMPLETE_PUZZLE, () =>
      setTimeout(() => {
        Event.emit(EVENT_PLAY_CLEAR);
        Event.emit(EVENT_PLAY_CLEAN_BACKGROUND);
      }, 1000)
    );
    Event.on(EVENT_PLAY_CLEAR, () => this.drawClear());
    Event.on(EVENT_PLAY_RESULT, () => this.drawResult());
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
    this.puzzlesView.position = this.toLocal(this.puzzlesView.getGlobalPosition());
    this.addChild(this.puzzlesView);

    this.boardView = Bottle.get('boardView');

    this.timeline
      .to(this.boardView, {
        duration: 1,
        pixi: {
          alpha: 0,
        },
      }, 0);

    this.timeline
      .to(this.puzzlesView, {
        duration: 1,
        pixi: {
          x: (this.size.width - this.puzzlesView.width) / 2,
          y: (this.size.height - this.puzzlesView.height) / 2,
        },
        onComplete: function() {
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
        onComplete: function() {
          Event.emit(EVENT_PLAY_FULL_COLORIZE);
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
    this.resultSprite.y = this.puzzlesView.y + this.puzzlesView.height / 2 + 20;
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
    this.resultText.y = this.puzzlesView.y + this.puzzlesView.height / 2 + 20;
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
