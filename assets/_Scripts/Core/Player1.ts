import { GameStates } from './States/GameStates';
import { PlayerStates } from './States/PlayerStates';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player1 extends cc.Component {
    @property(cc.Animation)
    animation: cc.Animation = null; // Анимация игрока

    private playerState: PlayerStates = PlayerStates.Idle; // Текущее состояние игрока
    private isFlipped: boolean = false; // Флаг для проверки, перевернут ли игрок

    // Вызывается при загрузке скрипта
    onLoad() {
        this.setState(PlayerStates.Idle); // Устанавливаем начальное состояние игрока
    }

    // Устанавливает состояние игрока и запускает соответствующую анимацию
    setState(state: PlayerStates) {
        if (this.playerState !== state) {
            this.playerState = state; // Обновляем состояние игрока
            this.animation.play(state); // Воспроизводим анимацию, соответствующую новому состоянию
            cc.log('Player state:', state, 'Animation:', this.animation.name); // Логируем изменение состояния
        }
    }

    // Возвращает текущее состояние игрока
    getState(): PlayerStates {
        return this.playerState;
    }

    // Переворачивает игрока вертикально
    flipPlayer() {
        this.isFlipped = !this.isFlipped; // Изменяем флаг переворота
        this.node.scaleY = this.isFlipped ? -1 : 1; // Изменяем масштаб по оси Y для переворота
        const newY = this.isFlipped ? this.node.position.y - this.node.width - 5 : this.node.position.y + this.node.width + 5;
        this.node.setPosition(this.node.position.x, newY); // Обновляем позицию игрока по Y
        cc.log('Player flipped:', this.isFlipped, 'New Position Y:', newY); // Логируем новую позицию игрока
    }

    // Заставляет игрока упасть с экрана
    fall() {
        this.setState(PlayerStates.Falling); // Устанавливаем состояние "падение"
        cc.tween(this.node)
            .to(0.5, { position: cc.v3(this.node.x, -1200) }) // Анимация падения игрока
            .start();
    }

    // Обработка столкновений с другими объектами
    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (other.node.group === 'Bonus') { // Проверка, если столкновение с бонусом
            cc.log('Player collided with bonus item');
            const gameState = cc.find('Canvas').getComponent('GameplayController').GameState; // Получение текущего состояния игры
            if (gameState === GameStates.Running || gameState === GameStates.Idle) {
                other.node.destroy(); // Уничтожаем узел бонуса
                const skuCounterNode = cc.find('Canvas/UI/SkuCounter'); // Ищем узел счетчика бонусов
                if (skuCounterNode) {
                    const skuCounter = skuCounterNode.getComponent('SkuCounter'); // Получаем компонент счетчика бонусов
                    if (skuCounter) {
                        skuCounter.increaseSkuCount('Bonus'); // Увеличиваем счетчик бонусов
                        this.node.emit('playCollectBonus'); // Испускаем событие для воспроизведения звука сбора бонуса
                    } else {
                        cc.error('SkuCounter component not found on SkuCounter node'); // Логируем ошибку, если компонент не найден
                    }
                } else {
                    cc.error('SkuCounter node not found in the scene'); // Логируем ошибку, если узел не найден
                }
            }
        }
        if (other.node.group === 'Platform') { // Проверка, если столкновение с платформой
            cc.log('Player collided with platform, failed');
            this.playerState = PlayerStates.Crash; // Устанавливаем состояние "столкновение"
        }
    }
}