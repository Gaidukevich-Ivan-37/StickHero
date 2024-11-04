import GameplayController from './GameplayController';
const { ccclass, property } = cc._decorator;

@ccclass
export default class Stick extends cc.Component {
    @property({ type: Number, displayName: 'Stick Growth Rate', tooltip: 'Rate at which stick grows' })
    stickGrowthRate: number = 400; // Скорость роста палки

    @property({ type: cc.Float, displayName: 'Angle Time', tooltip: 'Time for stick to fall' })
    angleTime: number = 0.25; // Время, за которое палка падает

    private isGrowing: boolean = false; // Флаг, указывающий, растет ли палка в данный момент

    /**
     * Начинает рост палки.
     */
    startStickGrowth() {
        this.isGrowing = true; // Устанавливаем флаг роста в true
    }

    /**
     * Останавливает рост палки.
     */
    stopStickGrowth() {
        this.isGrowing = false; // Устанавливаем флаг роста в false
    }

    /**
     * Логика роста палки.
     * @param {number} deltaTime - Время между кадрами.
     */
    growStick(deltaTime: number) {
        if (this.isGrowing) {
            // Увеличиваем высоту палки пропорционально скорости роста и времени между кадрами
            this.node.height += this.stickGrowthRate * deltaTime;

            // Если палка достигла максимальной высоты, останавливаем рост и вызываем метод окончания взаимодействия
            if (this.node.height >= 2500) {
                this.stopStickGrowth();
                this.node.parent.parent.getComponent(GameplayController).onTouchEnd(); // Обращаемся к контроллеру игры
            }
        }
    }

    /**
     * Анимация падения палки.
     */
    stickFall() {
        // Анимация падения палки с поворотом на -90 градусов
        cc.tween(this.node)
            .to(this.angleTime, { angle: -90 })
            .start();
    }

    /**
     * Анимация палки при неудачном падении.
     */
    stickOnFail() {
        // Анимация поворота палки на -180 градусов в случае неудачи
        cc.tween(this.node)
            .to(this.angleTime, { angle: -180 })
            .start();
    }
}