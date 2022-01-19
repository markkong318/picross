import * as PIXI from 'pixi.js';
import gsap from 'gsap';

import {View} from '../../../../framework/view';
import {PuzzlesTexture} from '../../../texture/puzzles-texture';
import Bottle from '../../../../framework/bottle';
import {BLOCK_HEIGHT, BLOCK_WIDTH} from '../../../env/block';
import {PuzzlesView} from '../board/puzzles-view';
import Event from '../../../../framework/event';
import {EVENT_INIT_PUZZLES_VIEW, EVENT_PLAT_CLEAN_HEAD_UP_DISPLAY, EVENT_UPDATE_LOCK} from '../../../env/event';

export class LockHudView extends View {
  private puzzlesView: PuzzlesView;

  private lockSprite: PIXI.Sprite;
  private floatLockSprite: PIXI.Sprite;

  private floatLockTimeline: gsap.core.Timeline;

  private clearHeadUpDisplayTimeline: gsap.core.Timeline;

  init() {
    this.puzzlesView = Bottle.get('puzzlesView');

    Event.on(EVENT_INIT_PUZZLES_VIEW, () => {
      this.initLock();
    });

    Event.on(EVENT_PLAT_CLEAN_HEAD_UP_DISPLAY, () => {
      this.playClearLock();
    });

    Event.on(EVENT_UPDATE_LOCK, (x, y) => this.setUpdatePosition(x, y));
  }

  initLock() {
    const texture = <PuzzlesTexture>Bottle.get('puzzlesTexture');

    this.lockSprite = new PIXI.Sprite(texture.lockTexture);
    this.lockSprite.alpha = 0;
    this.lockSprite.tint = 0x45d4ff;
    this.addChild(this.lockSprite);

    this.floatLockSprite = new PIXI.Sprite(texture.lockTexture);
    this.floatLockSprite.alpha = 0;
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
    this.floatLockTimeline.pause();

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

    this.lockSprite.x = this.puzzlesView.x + posX * BLOCK_WIDTH - 2;
    this.lockSprite.y = this.puzzlesView.y + posY * BLOCK_HEIGHT - 2;

    this.floatLockSprite.x = this.puzzlesView.x + posX * BLOCK_WIDTH - 2;
    this.floatLockSprite.y = this.puzzlesView.y + posY * BLOCK_HEIGHT - 2;
  }
}
