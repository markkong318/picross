import Connector from 'pixi-hammer';
import Hammer from 'hammerjs';

import {GameView} from "./view/game-view";
import {GameModel} from "./model/game-model";
import {GameController} from "./controller/game-controller";
import {Application} from "../framework/application"
import {Size} from "../framework/size";
import Bottle from "../framework/bottle";

export class GameApplication extends Application {
  private gameModel: GameModel;
  private gameController: GameController;
  private gameView: GameView;
  private connector: Connector;

  constructor(options?) {
    super(options);
    this.preload();
  }

  public preload(): void {
    this.loader
      .load((loader, resources) => {
        this.onAssetsLoaded();
      });
  }

  public onAssetsLoaded(): void {
    this.initScene();
  }

  public initScene(): void {
    var hammertime = new Hammer.Manager(this.view, {
      recognizers: [
        [Hammer.Pinch],
        [Hammer.Pan],
        [Hammer.Tap],
        // [Hammer.Tap, {event: 'doubletap', taps: 2, threshold: 7, posThreshold: 25}],
        // [Hammer.Tap, {event: 'singletap', threshold: 7}],
        [Hammer.Press, {time: 333, threshold: 3}]
      ]
    });

    this.connector = new Connector(this.view, this.renderer.plugins.interaction, hammertime);
    this.connector.registerHandlerTypes(['tap', 'panstart', 'pan', 'panend', 'pinchstart', 'pinch', 'pinchend']);
    Bottle.set('connector', this.connector);

    Bottle.set('renderer', this.renderer);

    this.gameModel = new GameModel();
    Bottle.set('gameModel', this.gameModel);

    this.gameController = new GameController();

    const viewWidth = 480;
    const viewHeight = this.getViewHeight(viewWidth);

    this.gameView = new GameView();
    this.gameView.size = new Size(viewWidth, viewHeight);
    this.gameView.init();

    this.stage.addChild(this.gameView);

    this.resizeView();
  }

  public getViewHeight(viewWidth) {
    if (this.renderer.width > this.renderer.height) {
      return 900;
    } else {
      return Math.floor(viewWidth * this.renderer.height / this.renderer.width);
    }
  }

  public resizeView(): void {
    if (this.renderer.width > this.renderer.height) {
      const scale = Math.min(this.renderer.width / this.gameView.size.width, this.renderer.height / this.gameView.size.height) / this.renderer.resolution;

      this.gameView.scale.x = scale;
      this.gameView.scale.y = scale;

      this.gameView.x = (this.renderer.width - this.gameView.size.width * scale * this.renderer.resolution) / 2 / this.renderer.resolution;
      this.gameView.y = (this.renderer.height - this.gameView.size.height * scale * this.renderer.resolution) / 2 / this.renderer.resolution;
    } else {
      const scale = this.renderer.width / this.gameView.size.width / this.renderer.resolution;

      this.gameView.scale.x = scale;
      this.gameView.scale.y = scale;

      this.gameView.x = 0;
      this.gameView.y = (this.renderer.height - this.gameView.size.height * scale * this.renderer.resolution) / 2 / this.renderer.resolution;
    }
  }
}
