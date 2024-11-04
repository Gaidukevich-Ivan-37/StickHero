// Импортируем декоратор из пространства имен cc (Cocos Creator).
const { ccclass, property } = cc._decorator;

// Используем декоратор @ccclass, чтобы обозначить, что этот класс будет компонентом Cocos Creator.
@ccclass
// Объявляем класс BonusItem, который наследуется от cc.Component и будет экспортироваться по умолчанию.
export default class BonusItem extends cc.Component {
    
    // Описание метода initPlatform.
    /**
     * Инициализирует бонусный объект.
     * @param {number} positionX - Позиция бонусного объекта по оси X.
     */
    initPlatform(positionX: number) {
        // Устанавливаем позицию узла (объекта) по оси X.
        this.node.x = positionX;
    }
}