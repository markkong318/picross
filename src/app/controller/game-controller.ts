import loadImage from 'blueimp-load-image';
import {Controller} from '../../framework/controller';
import {GameModel} from '../model/game-model';
import Bottle from '../../framework/bottle';
import Event from '../../framework/event';

import {
  BLOCK_WHITE,
  BLOCK_BLACK,
  BLOCK_X,
} from '../env/block';
import {
  EVENT_START_TOUCH_PUZZLE,
  EVENT_UPDATE_PUZZLE_VIEW,
  EVENT_UPDATE_HINT_VIEW,
  EVENT_FETCH_ANSWER_IMAGE,
  EVENT_INIT_DATA,
  EVENT_INIT_BOARD_VIEW,
  EVENT_COMPLETE_PUZZLE,
  EVENT_FETCH_ORIGIN_IMAGE,
  EVENT_END_TOUCH_PUZZLE,
  EVENT_UPDATE_TIMER,
  EVENT_START_TIMER,
  EVENT_STOP_TIMER,
  EVENT_SAVE_PUZZLE,
  EVENT_UPDATE_ROW_HINT_VIEW_SOLVED,
  EVENT_UPDATE_COLUMN_HINT_VIEW_SOLVED,
  EVENT_UPDATE_ROW_HINT_VIEW_NOT_SOLVED, EVENT_UPDATE_COLUMN_HINT_VIEW_NOT_SOLVED, EVENT_UPDATE_HINT_VIEW_SOLVED,
} from '../env/event';
import {Storage} from '../storage/storage';
import {fromEvent, interval} from 'rxjs';
import {debounce, scan} from 'rxjs/operators';

export class GameController extends Controller {
  private gameModel: GameModel;
  private intervalId;

  constructor() {
    super();

    this.gameModel = Bottle.get('gameModel');

    Event.on(EVENT_START_TOUCH_PUZZLE, (x, y) => {
      console.log(`(${x}, ${y}`);
      this.togglePuzzle(x, y);
      this.checkRowSolved(y);
      this.checkColumnSolved(x);

      Event.emit(EVENT_UPDATE_PUZZLE_VIEW, x, y);
      Event.emit(EVENT_UPDATE_HINT_VIEW, x, y);
    });

    Event.on(EVENT_END_TOUCH_PUZZLE, (x, y) => {
      Event.emit(EVENT_UPDATE_PUZZLE_VIEW, x, y);
      Event.emit(EVENT_UPDATE_HINT_VIEW, x, y);

      if (this.isCompleted()) {
        console.log('completed');
        Event.emit(EVENT_COMPLETE_PUZZLE);
      }
    });

    Event.on(EVENT_FETCH_ANSWER_IMAGE, () => {
      this.initAnswer(EVENT_FETCH_ORIGIN_IMAGE);
    });

    Event.on(EVENT_FETCH_ORIGIN_IMAGE, () => {
      this.initOrigin(EVENT_INIT_DATA);
    });

    Event.on(EVENT_INIT_DATA, () => {
      this.initHintColumns();
      this.initHintRows();
      this.initPuzzles();
      this.initGodMode();
      this.initAutoSave();

      Event.emit(EVENT_INIT_BOARD_VIEW);
    });

    Event.on(EVENT_UPDATE_HINT_VIEW_SOLVED, () => {
      this.checkColumnsSolved();
      this.checkRowsSolved();
    });

    Event.on(EVENT_START_TIMER, () => this.startTimer());
    Event.on(EVENT_STOP_TIMER, () => this.stopTimer());
  }

  initAnswer(next) {
    const searchParams = Bottle.get('searchParams');
    const answer = searchParams.get('answer') || 'jjVYPNF.jpg';
    const threshold = searchParams.get('threshold') || 128;
    let width = parseInt(searchParams.get('width'));
    let height = parseInt(searchParams.get('height'));

    console.log(`answer: ${answer}`);

    loadImage(
      `https://i.imgur.com/${answer}`,
      (canvas) => {
        console.log('init answer')
        console.log(canvas);

        width = width || canvas.width;
        height = height || canvas.height;

        this.gameModel.puzzleWidth = width;
        this.gameModel.puzzleHeight = height;

        const context = canvas.getContext('2d');
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;

        const answers = new Array(width);
        for (let i = 0; i < answers.length; i++) {
          answers[i] = new Array(height);
        }

        const ow = canvas.width / width;
        const oh = canvas.height / height;

        for (let i = 0; i < answers.length; i++) {
          for (let j = 0; j < answers[i].length; j++) {
            const ci = Math.floor(ow / 2) + i * ow;
            const cj = Math.floor(oh / 2) + j * oh;

            answers[i][j] =
              (
                data[(cj * canvas.width + ci) * 4] +
                data[(cj * canvas.width + ci) * 4 + 1] +
                data[(cj * canvas.width + ci) * 4 + 2]
              ) / 3 < threshold ? BLOCK_BLACK : BLOCK_WHITE;

            console.log(`ans (${i}, ${j}) => rgb(${data[(cj * canvas.width + ci) * 4]}, ${data[(cj * canvas.width + ci) * 4 + 1]}, ${data[(cj * canvas.width + ci) * 4 + 2]}) alpha: ${data[(cj * canvas.width + ci) * 4 + 3]}`)
          }
        }

        // const answers = new Array(canvas.width);
        // for (let i = 0; i < answers.length; i++) {
        //   answers[i] = new Array(canvas.height);
        // }
        //
        // for (let i = 0; i < answers.length; i++) {
        //   for (let j = 0; j < answers[i].length; j++) {
        //     answers[i][j] =
        //       (
        //         data[(j * canvas.width + i) * 4] +
        //         data[(j * canvas.width + i) * 4 + 1] +
        //         data[(j * canvas.width + i) * 4 + 2]
        //       ) / 3 < threshold ? BLOCK_BLACK : BLOCK_WHITE;
        //
        //     if (data[(j * canvas.width + i) * 4 + 3] <= 128) {
        //       answers[i][j] = BLOCK_WHITE;
        //     }
        //
        //     console.log(`ans (${i}, ${j}) => rgb(${data[(j * canvas.width + i) * 4]}, ${data[(j * canvas.width + i) * 4 + 1]}, ${data[(j * canvas.width + i) * 4 + 2]}) alpha: ${data[(j * canvas.width + i) * 4 + 3]}`)
        //   }
        // }

        console.log("answer:");
        console.log(answers);

        this.gameModel.answer = answers;

        Event.emit(next);
      },
      {canvas: true, crossOrigin: true},
    );
  }

  initOrigin(next) {
    const searchParams = Bottle.get('searchParams');
    const origin = searchParams.get('origin') || 'jjVYPNF.jpg';
    const bgcolor = parseInt(searchParams.get('bgcolor')) || 0x0;
    let width = parseInt(searchParams.get('width'));
    let height = parseInt(searchParams.get('height'));

    console.log(`answer: ${origin}`);

    loadImage(
      `https://i.imgur.com/${origin}`,
      (canvas) => {
        console.log('initOrigin')
        console.log(canvas);
        const context = canvas.getContext('2d');
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;

        width = width || canvas.width;
        height = height || canvas.height;

        const origins = new Array(width);
        for (let i = 0; i < origins.length; i++) {
          origins[i] = new Array(height);
        }

        const ow = canvas.width / width;
        const oh = canvas.height / height;

        for (let i = 0; i < origins.length; i++) {
          for (let j = 0; j < origins[i].length; j++) {
            const ci = Math.floor(ow / 2) + i * ow;
            const cj = Math.floor(oh / 2) + j * oh;

            if (data[(cj * canvas.width + ci) * 4] === 0 &&
              data[(cj * canvas.width + ci) * 4 + 1] === 0 &&
              data[(cj * canvas.width + ci) * 4 + 2] === 0 &&
              data[(cj * canvas.width + ci) * 4 + 3] === 0) {
              origins[i][j] = bgcolor;
            } else {
              origins[i][j] =
                (
                  data[(cj * canvas.width + ci) * 4] * 256 * 256 +
                  data[(cj * canvas.width + ci) * 4 + 1] * 256 +
                  data[(cj * canvas.width + ci) * 4 + 2]
                );
            }

            console.log(`(${i}, ${j}) => rgb(${data[(cj * canvas.width + ci) * 4]}, ${data[(cj * canvas.width + ci) * 4 + 1]}, ${data[(cj * canvas.width + ci) * 4 + 2]})`)
          }
        }

        console.log("origins:");
        console.log(origins);

        this.gameModel.origins = origins;

        Event.emit(next);
      },
      {canvas: true, crossOrigin: true},
    );
  }

  initHintRows() {
    const answer = this.gameModel.answer;

    const hintRows = new Array(this.gameModel.puzzleHeight);
    for (let i = 0; i < hintRows.length; i++) {
      hintRows[i] = [];
    }

    for (let i = 0; i < answer[0].length; i++) {
      let count = 0;

      for (let j = 0; j < answer.length; j++) {
        if (answer[j][i] === BLOCK_WHITE) {
          if (count > 0) {
            hintRows[i].push(count);
            count = 0;
          }
          continue;
        }
        count++;
      }

      if (count > 0) {
        hintRows[i].push(count);
      }
    }

    this.gameModel.hintRows = hintRows;
  }

  initHintColumns() {
    const answer = this.gameModel.answer;

    const hintColumns = new Array(this.gameModel.puzzleWidth);
    for (let i = 0; i < hintColumns.length; i++) {
      hintColumns[i] = [];
    }

    for (let i = 0; i < answer.length; i++) {
      let count = 0;

      for (let j = 0; j < answer[i].length; j++) {
        if (answer[i][j] === BLOCK_WHITE) {
          if (count > 0) {
            hintColumns[i].push(count);
            count = 0;
          }
          continue;
        }
        count++;
      }

      if (count > 0) {
        hintColumns[i].push(count);
      }
    }

    this.gameModel.hintColumns = hintColumns;
  }

  initPuzzles() {
    const searchParams = Bottle.get('searchParams');
    const origin = searchParams.get('origin');
    const answer = searchParams.get('answer');
    const title = searchParams.get('title');

    const storage = <Storage>Bottle.get('storage');

    let {
      puzzles,
      timer,
    } = storage.loadPuzzles(origin, answer, title);

    if (!puzzles) {
      const puzzleWidth = this.gameModel.puzzleWidth;
      const puzzleHeight = this.gameModel.puzzleHeight;

      puzzles = new Array(puzzleWidth);
      for (let i = 0; i < puzzles.length; i++) {
        puzzles[i] = new Array(puzzleHeight);
        for (let j = 0; j < puzzles[i].length; j++) {
          puzzles[i][j] = BLOCK_WHITE;
        }
      }
    }

    if (!timer) {
      timer = 0;
    }

    this.gameModel.puzzle = puzzles;
    this.gameModel.timer = timer;
  }

  checkRowsSolved() {
    for (let i = 0; i < this.gameModel.puzzleHeight; i++) {
      this.checkRowSolved(i);
    }
  }

  checkColumnsSolved() {
    for (let i = 0; i < this.gameModel.puzzleWidth; i++) {
      this.checkColumnSolved(i);
    }
  }

  initGodMode() {
    const searchParams = Bottle.get('searchParams');
    const god = parseInt(searchParams.get('god') || '0');

    if (god) {
      console.log('god mode on');

      const answer = this.gameModel.answer;
      const puzzle = this.gameModel.puzzle;

      for (let i = 0; i < answer.length; i++) {
        for (let j = 0; j < answer[i].length; j++){
          switch (answer[i][j]) {
            case BLOCK_BLACK:
              puzzle[i][j] = BLOCK_BLACK;
              break;
            case BLOCK_WHITE:
              puzzle[i][j] = BLOCK_X;
              break;
          }
        }
      }
    }
  }

  initAutoSave() {
    const clicks = fromEvent(Event, EVENT_SAVE_PUZZLE);
    const result = clicks.pipe(
      scan((i) => ++i, 1),
      debounce((i) => interval(500 * i))
    );
    result.subscribe(x => {
      const searchParams = Bottle.get('searchParams');
      const origin = searchParams.get('origin');
      const answer = searchParams.get('answer');
      const title = searchParams.get('title');

      const storage = <Storage>Bottle.get('storage');

      const puzzles = this.gameModel.puzzle;
      const timer = this.gameModel.timer;

      console.log('saving...')

      storage.savePuzzles(origin, answer, title, puzzles, timer);
    });
  }

  cleanSave() {
    const searchParams = Bottle.get('searchParams');
    const origin = searchParams.get('origin');
    const answer = searchParams.get('answer');
    const title = searchParams.get('title');

    const storage = <Storage>Bottle.get('storage');

    storage.clearPuzzles(origin, answer, title);
  }

  isCompleted() {
    const puzzle = this.gameModel.puzzle;
    const answer = this.gameModel.answer;

    let ret = true;

    for (let i = 0; i < puzzle.length; i++) {
      for (let j = 0; j < puzzle[i].length; j++) {
        if (puzzle[i][j] === BLOCK_WHITE) {
          ret = false;
          break;
        }

        if (puzzle[i][j] === BLOCK_BLACK && answer[i][j] !== BLOCK_BLACK) {
          ret = false;
          break;
        }

        if (puzzle[i][j] === BLOCK_X && answer[i][j] !== BLOCK_WHITE) {
          ret = false;
          break;
        }
      }
    }

    return ret;
  }

  checkRowSolved(y) {
    const hintRows = this.gameModel.hintRows;
    const puzzle = this.gameModel.puzzle;

    const target = [];

    let count = 0;
    for (let i = 0; i < puzzle.length; i++) {
      if (puzzle[i][y] === BLOCK_WHITE || puzzle[i][y] === BLOCK_X) {
        if (count > 0) {
          target.push(count);
          count = 0;
        }
        continue;
      }
      count++;
    }

    if (count > 0) {
      target.push(count);
    }

    let solved = true;

    if (hintRows[y].length !== target.length) {
      solved = false;
    } else {
      for (let i = 0; i < target.length; i++) {
        if (target[i] !== hintRows[y][i]) {
          solved = false;
        }
      }
    }

    if (!solved) {
      Event.emit(EVENT_UPDATE_ROW_HINT_VIEW_NOT_SOLVED, y);
      return;
    }

    Event.emit(EVENT_UPDATE_ROW_HINT_VIEW_SOLVED, y);
  }

  checkColumnSolved(x) {
    const hintColumns = this.gameModel.hintColumns;
    const puzzle = this.gameModel.puzzle;

    const target = [];

    let count = 0;
    for (let i = 0; i < puzzle[x].length; i++) {
      if (puzzle[x][i] === BLOCK_WHITE || puzzle[x][i] === BLOCK_X) {
        if (count > 0) {
          target.push(count);
          count = 0;
        }
        continue;
      }
      count++;
    }

    if (count > 0) {
      target.push(count);
    }

    let solved = true;

    if (hintColumns[x].length !== target.length) {
      solved = false;
    } else {
      for (let i = 0; i < target.length; i++) {
        if (target[i] !== hintColumns[x][i]) {
          solved = false;
        }
      }
    }

    if (!solved) {
      Event.emit(EVENT_UPDATE_COLUMN_HINT_VIEW_NOT_SOLVED, x);
      return;
    }

    Event.emit(EVENT_UPDATE_COLUMN_HINT_VIEW_SOLVED, x);
  }

  togglePuzzle(x, y) {
    let puzzle = this.gameModel.puzzle[x][y];

    if (puzzle == BLOCK_WHITE) {
      puzzle = BLOCK_BLACK;
    } else if (puzzle == BLOCK_BLACK) {
      puzzle = BLOCK_X;
    } else if (puzzle === BLOCK_X) {
      puzzle = BLOCK_WHITE;
    }

    this.gameModel.puzzle[x][y] = puzzle;
  }

  startTimer() {
    this.intervalId = setInterval(() => {
      this.gameModel.timer++;
      Event.emit(EVENT_UPDATE_TIMER);
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.intervalId);
  }
}
