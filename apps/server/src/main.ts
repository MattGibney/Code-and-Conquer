import Game from './game';
import Player from './player';

const game = new Game({
  map: 'map_1',
  maxPlayers: 2,
  startingResources: 1000,
});

const player1 = new Player('Player 1', '#444e81');
game.addPlayer(player1);

game.start();


const terrain = game.map.terrain;
const player1Data = player1.serialise();
