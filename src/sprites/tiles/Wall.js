import BaseTile from './BaseTile';
export default class Wall extends BaseTile {
    static spriteKey = 'wall';
    pushable = true;
}