import * as PIXI from 'pixi.js';

import {View} from '../../../framework/view';
import Bottle from '../../../framework/bottle';
import {BoardView} from './board-view';
import {EVENT_INIT_PINCH, EVENT_REMOVE_PINCH} from '../../env/event';
import Event from '../../../framework/event';

export class PinchView extends View {
  // private boardView: BoardView;

  constructor() {
    super();
  }

  public init() {
    this.interactive = true;

    const bg = new PIXI.Sprite(PIXI.Texture.EMPTY);
    bg.width = this.size.width;
    bg.height = this.size.height;
    this.addChild(bg);

    Event.on(EVENT_INIT_PINCH, () => this.initPinchEvent());
    Event.on(EVENT_REMOVE_PINCH, () => this.removePinchEvent());
  }

  public initPinchEvent() {
    console.log('init pinch');

    this.on('hammer-pinchstart', (e) => {
      const boardView = Bottle.get('boardView');
      boardView.emit('hammer-pinchstart', e);
    });

    this.on('hammer-pinch', (e) => {
      const boardView = Bottle.get('boardView');
      boardView.emit('hammer-pinch', e)
    });

    this.on('hammer-pinchend', (e) => {
      const boardView = Bottle.get('boardView');
      boardView.emit('hammer-pinchend', e);
    });

    this.on('hammer-panstart', (e) => {
      console.log('hammer-panstart')
      const puzzlesView = Bottle.get('puzzlesView');
      puzzlesView.emit('hammer-panstart', e);
    });

    this.on('hammer-pan', (e) => {
      console.log('hammer-pan')
      const puzzlesView = Bottle.get('puzzlesView');
      puzzlesView.emit('hammer-pan', e);
    });

    this.on('hammer-panend', (e) => {
      console.log('hammer-panend')
      const puzzlesView = Bottle.get('puzzlesView');
      puzzlesView.emit('hammer-panend', e);
    });

    this.on('hammer-tap', (e) => {
      console.log('hammer-tap')
      const puzzlesView = Bottle.get('puzzlesView');
      puzzlesView.emit('hammer-tap', e);
    });

    // this.on('pointerdown', (e) => {
    //   const puzzlesView = Bottle.get('puzzlesView');
    //   puzzlesView.emit('pointerdown', e);
    // });
    //
    // this.on('pointermove', (e) => {
    //   const puzzlesView = Bottle.get('puzzlesView');
    //   puzzlesView.emit('pointermove', e);
    // });
    //
    // this.on('pointerup', (e) => {
    //   const puzzlesView = Bottle.get('puzzlesView');
    //   puzzlesView.emit('pointerup', e)
    // });
  }

  public removePinchEvent() {
    this.off('hammer-pinch');
    this.off('pointerdown');
    this.off('pointermove');
    this.off('pointerup');
  }
}
