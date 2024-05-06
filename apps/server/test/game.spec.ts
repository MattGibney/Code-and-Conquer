import Game from '../src/game';
import Unit from '../src/unit';

describe('Game', () => {
  it('increments the tick count', () => {
    const game = new Game();
    game.tickGameLoop();
    expect(game.tick).toBe(2);

    game.tickGameLoop();
    expect(game.tick).toBe(3);
  });

  it('executes the run method for each unit', () => {
    const game = new Game();
    const unit1 = { run: jest.fn() };
    const unit2 = { run: jest.fn() };
    game.units.push(
      unit1 as unknown as Unit,
      unit2 as unknown as Unit
    );

    game.tickGameLoop();

    expect(unit1.run).toHaveBeenCalled();
    expect(unit2.run).toHaveBeenCalled();
  });
});
