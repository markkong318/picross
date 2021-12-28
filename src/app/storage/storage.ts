export class Storage {
  constructor() {
  }

  init() {

  }

  savePuzzles(origin: string, answer: string, title: string, puzzles: number[][]) {
    const puzzlesStr = JSON.stringify(puzzles);
    localStorage.setItem(`${origin}-${answer}-${title}`, puzzlesStr);
  }

  loadPuzzles(origin: string, answer: string, title: string) {
    const puzzlesStr = localStorage.getItem(`${origin}-${answer}-${title}`);
    if (!puzzlesStr) {
      return;
    }

    return JSON.parse(puzzlesStr);
  }

  clearPuzzles(origin: string, answer: string, title: string) {
    localStorage.removeItem(`${origin}-${answer}-${title}`)
  }
}
