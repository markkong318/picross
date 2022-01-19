export class Storage {
  constructor() {
  }

  init() {

  }

  savePuzzles(origin: string, answer: string, title: string, puzzles: number[][], timer: number) {
    const data = JSON.stringify({
      puzzles,
      timer,
    });
    localStorage.setItem(`${origin}-${answer}-${title}`, data);
  }

  loadPuzzles(origin: string, answer: string, title: string) {
    const data = localStorage.getItem(`${origin}-${answer}-${title}`);
    if (!data) {
      return {};
    }

    return JSON.parse(data);
  }

  clearPuzzles(origin: string, answer: string, title: string) {
    localStorage.removeItem(`${origin}-${answer}-${title}`)
  }
}
