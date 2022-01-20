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

  private sprite: PIXI.Sprite;
  private animeSprite: PIXI.Sprite;

  private animeTimeline: gsap.core.Timeline;

  private clearTimeline: gsap.core.Timeline;

  init() {
    this.puzzlesView = Bottle.get('puzzlesView');

    Event.on(EVENT_INIT_PUZZLES_VIEW, () => {
      this.initLock();
    });

    Event.on(EVENT_PLAT_CLEAN_HEAD_UP_DISPLAY, () => {
      this.playClearLock();
    });

    Event.on(EVENT_UPDATE_LOCK, (x, y) => {
      this.setUpdatePosition(x, y);
    });
  }

  initLock() {
    const texture = <PuzzlesTexture>Bottle.get('puzzlesTexture');

    this.sprite = new PIXI.Sprite(texture.lockTexture);
    this.sprite.alpha = 0;
    this.sprite.tint = 0x45d4ff;
    this.addChild(this.sprite);

    this.animeSprite = new PIXI.Sprite(texture.lockTexture);
    this.animeSprite.alpha = 0;
    this.animeSprite.tint = 0x0277fd;
    this.addChild(this.animeSprite);

    this.animeTimeline = gsap.timeline();
    this.animeTimeline.pause();
    this.animeTimeline
      .to(this.animeSprite, {
        duration: 1,
        pixi: {
          alpha: 0,
        },
        repeat: -1,
        yoyo: true,
      }, 0);

    this.clearTimeline = gsap.timeline();
  }

  playClearLock() {
    this.animeTimeline.pause();

    this.clearTimeline
      .to(this.sprite, {
        duration: 1,
        pixi: {
          alpha: 0,
        },
      }, 0);

    this.clearTimeline
      .to(this.animeSprite, {
        duration: 1,
        pixi: {
          alpha: 0,
        },
      }, 0);
  }

  setUpdatePosition(posX, posY) {
    this.sprite.alpha = 1;
    this.animeSprite.alpha = 1;

    if (this.animeTimeline.paused()) {
      this.animeTimeline.play();
    }

    this.sprite.x = this.puzzlesView.x + posX * BLOCK_WIDTH - 2;
    this.sprite.y = this.puzzlesView.y + posY * BLOCK_HEIGHT - 2;

    this.animeSprite.x = this.puzzlesView.x + posX * BLOCK_WIDTH - 2;
    this.animeSprite.y = this.puzzlesView.y + posY * BLOCK_HEIGHT - 2;
  }
}
