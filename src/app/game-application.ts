import * as PIXI from 'pixi.js';

import {GameView} from "./view/game-view";
import {GameModel} from "./model/game-model";
import {GameController} from "./controller/game-controller";
import {Application} from "../framework/application"
import {Size} from "../framework/size";
import Bottle from "../framework/bottle";

export class GameApplication extends Application {
  private _gameModel: GameModel;
  private _gameController: GameController;
  private _gameView: GameView;

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
    this._gameModel = new GameModel();
    Bottle.set('gameModel', this._gameModel);

    this._gameController = new GameController();

    this._gameView = new GameView();
    this._gameView.size = new Size(480, 800);
    this._gameView.init();

    this.stage.addChild(this._gameView);

    this.resizeView();
  }

  public resizeView(): void {
    if (this.renderer.width > this.renderer.height) {
      const scale = Math.min(this.renderer.width / this._gameView.size.width, this.renderer.height / this._gameView.size.height) / this.renderer.resolution;

      console.log("this.renderer.width: " + this.renderer.width);
      console.log("this._gameView.size: " + this._gameView.size.width);

      console.log("this.renderer.height: " + this.renderer.height);
      console.log("this._gameView.height: " + this._gameView.size.height);

      console.log("scale: " + scale);

      console.log("this._gameView.scale.x: " + this._gameView.scale.x);

      this._gameView.scale.x = scale;
      this._gameView.scale.y = scale;

      console.log("this._gameView.scale.x: " + this._gameView.scale.x);

      console.log("this._gameView.size*: " + this._gameView.size.width);

      this._gameView.x = (this.renderer.width - this._gameView.size.width * scale * this.renderer.resolution) / 2 / this.renderer.resolution;
      this._gameView.y = (this.renderer.height - this._gameView.size.height * scale * this.renderer.resolution) / 2 / this.renderer.resolution;
    } else {
      console.log("hello");
      this._gameView.width = this.renderer.width;
      this._gameView.height = this.renderer.height;
    }
  }
}
