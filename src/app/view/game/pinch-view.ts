import * as PIXI from 'pixi.js';

import {View} from '../../../framework/view';
import Bottle from '../../../framework/bottle';
import {BoardView} from './board-view';
import {EVENT_INIT_PINCH, EVENT_REMOVE_PINCH} from '../../env/event';
import Event from '../../../framework/event';

export class PinchView extends View {
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
    this.on('hammer-pinchstart', (event) => {
      const boardView = Bottle.get('boardView');
      boardView.emit('hammer-pinchstart', event);
    });

    this.on('hammer-pinch', (event) => {
      const boardView = Bottle.get('boardView');
      boardView.emit('hammer-pinch', event)
    });

    this.on('hammer-pinchend', (event) => {
      const boardView = Bottle.get('boardView');
      boardView.emit('hammer-pinchend', event);
    });

    this.on('hammer-panstart', (event) => {
      console.log('hammer-panstart')
      const puzzlesView = Bottle.get('puzzlesView');
      puzzlesView.emit('hammer-panstart', event);
    });

    this.on('hammer-pan', (event) => {
      console.log('hammer-pan')
      const puzzlesView = Bottle.get('puzzlesView');
      puzzlesView.emit('hammer-pan', event);
    });

    this.on('hammer-panend', (event) => {
      console.log('hammer-panend')
      const puzzlesView = Bottle.get('puzzlesView');
      puzzlesView.emit('hammer-panend', event);
    });

    this.on('hammer-tap', (event) => {
      console.log('hammer-tap')
      const puzzlesView = Bottle.get('puzzlesView');
      puzzlesView.emit('hammer-tap', event);
    });
  }

  public removePinchEvent() {
    this.off('hammer-pinchstart');
    this.off('hammer-pinch');
    this.off('hammer-pinchend');
    this.off('hammer-panstart');
    this.off('hammer-pan');
    this.off('hammer-panend');
    this.off('hammer-tap');
  }
}
