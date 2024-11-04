const { ccclass, property } = cc._decorator;

@ccclass
export default class Platform extends cc.Component {
    @property({ type: cc.Float, displayName: 'Min Width', tooltip: 'Минимальная ширина платформы' })
    platformMinWidth: number = 50; // Минимальная ширина платформы

    @property({ type: cc.Float, displayName: 'Max Width', tooltip: 'Максимальная ширина платформы' })
    platformMaxWidth: number = 300; // Максимальная ширина платформы

    @property({ type: cc.Node, displayName: 'Bonus Platform', tooltip: 'Бонусная платформа' })
    bonusPlatform: cc.Node = null; // Узел бонусной платформы

    @property({ type: cc.Float, displayName: 'Bonus Platform Min Width', tooltip: 'Минимальная ширина бонусной платформы' })
    bonusPlatformMinWidth: number = 10; // Минимальная ширина бонусной платформы

    @property({ type: cc.Float, displayName: 'Bonus Platform Max Width', tooltip: 'Максимальная ширина бонусной платформы' })
    bonusPlatformMaxWidth: number = 50; // Максимальная ширина бонусной платформы

    @property({ type: cc.Boolean, displayName: 'Bonus Platform showed', tooltip: 'Отображается ли бонусная платформа' })
    bonusPlatformShowed: boolean = true; // Указывает, отображается ли бонусная платформа

    // Вызывается при загрузке скрипта
    onLoad() {
        this.bonusPlatform.zIndex = 997; // Устанавливает порядок отображения бонусной платформы
    }

    // Инициализация платформы с заданной позицией и шириной
    initPlatform(positionX: number, initialWidth: number = 0, bonusPlatformVisible: boolean = true) {
        console.log("initPlatform", positionX, initialWidth);

        // Установка позиции платформы
        this.node.x = positionX;
        // Установка ширины платформы (если не задано, генерируется случайная ширина)
        this.node.width = initialWidth > 0 ? initialWidth : this.platformMinWidth + Math.random() * (this.platformMaxWidth - this.platformMinWidth);

        // Добавление коллайдера для проверки столкновений
        const collider = this.node.addComponent(cc.BoxCollider);
        collider.size = new cc.Size(this.node.width, this.node.height - 10);
        collider.offset = new cc.Vec2(0, -5);

        // Расчёт ширины бонусной платформы на основе ширины основной платформы
        let bonusPlatformProportion = (this.node.width - this.platformMinWidth) / (this.platformMaxWidth - this.platformMinWidth);
        this.bonusPlatform.width = this.bonusPlatformMinWidth + bonusPlatformProportion * (this.bonusPlatformMaxWidth - this.bonusPlatformMinWidth);

        // Установка видимости бонусной платформы
        this.setBonusPlatformVisibility(bonusPlatformVisible);

        console.log("Platform width set to", this.node.width);
        console.log("Bonus Platform width set to", this.bonusPlatform.width);
    }

    // Проверка, касается ли палка платформы или бонусной платформы
    isStickTouching(stickRightX: number): boolean {
        console.log("isStickTouching", stickRightX, this.node.x, this.node.width);

        // Расчёт левой и правой границы бонусной платформы
        const bonusPlatformLeft = this.node.x + this.bonusPlatform.x - this.bonusPlatform.width / 2;
        const bonusPlatformRight = this.node.x + this.bonusPlatform.x + this.bonusPlatform.width / 2;

        // Проверка, касается ли палка бонусной платформы
        if (this.bonusPlatformShowed && stickRightX > bonusPlatformLeft && stickRightX < bonusPlatformRight) {
            console.log("Bonus platform touched");
            this.node.emit('bonusPlatformTouched'); // Событие для обработки касания бонусной платформы
        }

        // Расчёт левой и правой границы основной платформы
        const platformLeft = this.node.x - this.node.width / 2;
        const platformRight = this.node.x + this.node.width / 2;

        // Проверка, касается ли палка основной платформы
        if (stickRightX > platformLeft && stickRightX < platformRight) {
            console.log("Platform touched");
            return true; // Возвращает true, если палка касается платформы
        }

        return false; // Возвращает false, если касания нет
    }

    // Установка видимости бонусной платформы
    setBonusPlatformVisibility(visible: boolean) {
        this.bonusPlatform.active = this.bonusPlatformShowed = visible; // Устанавливает активность узла бонусной платформы
    }
}