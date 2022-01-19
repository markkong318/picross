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
  EVENT_STOP_TIMER, EVENT_SAVE_PUZZLE, EVENT_UPDATE_ROW_HINT_VIEW_SOLVED, EVENT_UPDATE_COLUMN_HINT_VIEW_SOLVED,
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
      this.togglePuzzle(x, y);
      this.checkRowSolved(x);
      this.checkColumnSolved(y);

      Event.emit(EVENT_UPDATE_PUZZLE_VIEW, x, y);
      Event.emit(EVENT_UPDATE_HINT_VIEW, x, y);
    });

    Event.on(EVENT_END_TOUCH_PUZZLE, (x, y) => {
      Event.emit(EVENT_UPDATE_PUZZLE_VIEW, x, y);
      Event.emit(EVENT_UPDATE_HINT_VIEW, x, y);

      setTimeout(() => {
        // console.log('EVENT_COMPLETE_PUZZLE')
        // Event.emit(EVENT_COMPLETE_PUZZLE);
      }, 1000);

      if (this.isCompleted()) {
        console.log('completed');
        this.cleanSave();

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
      this.initAutoSave();

      Event.emit(EVENT_INIT_BOARD_VIEW);
    });

    Event.on(EVENT_START_TIMER, () => this.startTimer());
    Event.on(EVENT_STOP_TIMER, () => this.stopTimer());
  }

  initAnswer(next) {
    const searchParams = Bottle.get('searchParams');
    const answer = searchParams.get('answer') || 'jjVYPNF.jpg';

    console.log(`answer: ${answer}`);

    loadImage(
      `https://i.imgur.com/${answer}`,
      (canvas) => {
        console.log('init answer')
        console.log(canvas);

        this.gameModel.puzzleWidth = canvas.width;
        this.gameModel.puzzleHeight = canvas.height;

        const context = canvas.getContext('2d');
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;

        const answers = new Array(canvas.width);
        for (let i = 0; i < answers.length; i++) {
          answers[i] = new Array(canvas.height);
        }

        for (let i = 0; i < answers.length; i++) {
          for (let j = 0; j < answers[i].length; j++) {
            answers[i][j] =
              (
                data[(i * answers[i].length + j) * 4] +
                data[(i * answers[i].length + j) * 4 + 1] +
                data[(i * answers[i].length + j) * 4 + 2]
              ) / 3 < 128 ? BLOCK_BLACK : BLOCK_WHITE;

            console.log(`ans (${i}, ${j}) => rgb(${data[(i * answers[i].length + j) * 4]}, ${data[(i * answers[i].length + j) * 4 + 1]}, ${data[(i * answers[i].length + j) * 4 + 2]}) alpha: ${data[(i * answers[i].length + j) * 4 + 3]}`)

          }
        }

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

    console.log(`answer: ${origin}`);

    loadImage(
      `https://i.imgur.com/${origin}`,
      (canvas) => {
        console.log('initOrigin')
        console.log(canvas);
        const context = canvas.getContext('2d');
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;

        const origins = new Array(canvas.width);
        for (let i = 0; i < origins.length; i++) {
          origins[i] = new Array(canvas.height);
        }

        for (let i = 0; i < origins.length; i++) {
          for (let j = 0; j < origins[i].length; j++) {
            origins[i][j] =
              (
                data[(i * origins[i].length + j) * 4] * 256 * 256 +
                data[(i * origins[i].length + j) * 4 + 1] * 256 +
                data[(i * origins[i].length + j) * 4 + 2]
              );

            console.log(`(${i}, ${j}) => rgb(${data[(i * origins[i].length + j) * 4]}, ${data[(i * origins[i].length + j) * 4 + 1]}, ${data[(i * origins[i].length + j) * 4 + 2]})`)
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
    const puzzleHeight = this.gameModel.puzzleHeight;

    const hintRows = new Array(puzzleHeight);
    for (let i = 0; i < hintRows.length; i++) {
      hintRows[i] = [];
    }

    for (let i = 0; i < answer.length; i++) {
      let count = 0;

      for (let j = 0; j < answer[i].length; j++) {
        if (answer[i][j] === BLOCK_WHITE) {
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
    const puzzleWidth = this.gameModel.puzzleWidth;

    const hintColumns = new Array(puzzleWidth);
    for (let i = 0; i < hintColumns.length; i++) {
      hintColumns[i] = [];
    }

    for (let i = 0; i < answer[0].length; i++) {
      let count = 0;

      for (let j = 0; j < answer.length; j++) {
        if (answer[j][i] === BLOCK_WHITE) {
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

  checkRowSolved(x) {
    const puzzle = this.gameModel.puzzle;
    const answer = this.gameModel.answer;

    let solved = true;

    // TODO: match black count only
    for (let i = 0; i < puzzle.length; i++) {
      if (puzzle[x][i] === BLOCK_WHITE) {
        solved = false;
        break;
      }

      if (puzzle[x][i] === BLOCK_BLACK && answer[x][i] !== BLOCK_BLACK) {
        solved = false;
        break;
      }

      if (puzzle[x][i] === BLOCK_X && answer[x][i] !== BLOCK_WHITE) {
        solved = false;
        break;
      }
    }

    if (!solved) {
      return;
    }

    Event.emit(EVENT_UPDATE_ROW_HINT_VIEW_SOLVED);
  }

  checkColumnSolved(y) {
    console.log('checkColumnSolved')
    const puzzle = this.gameModel.puzzle;
    const answer = this.gameModel.answer;

    let solved = true;

    // TODO: match black count only
    for (let i = 0; i < puzzle.length; i++) {
      if (puzzle[i][y] === BLOCK_WHITE) {
        solved = false;
        break;
      }

      if (puzzle[i][y] === BLOCK_BLACK && answer[i][y] !== BLOCK_BLACK) {
        solved = false;
        break;
      }

      if (puzzle[i][y] === BLOCK_X && answer[i][y] !== BLOCK_WHITE) {
        solved = false;
        break;
      }
    }

    if (!solved) {
      return;
    }

    Event.emit(EVENT_UPDATE_COLUMN_HINT_VIEW_SOLVED);
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
