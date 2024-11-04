const { ccclass, property } = cc._decorator;

@ccclass
export default class ScoreController extends cc.Component {

    @property({ type: cc.Node, displayName: 'Score Text Node', tooltip: 'Узел, отображающий счет' })
    scoreTextNode: cc.Node = null; // Узел для отображения текущего счета

    @property({ type: cc.Node, displayName: 'Perfect Label Node', tooltip: 'Узел, отображающий метку "Идеально"' })
    perfectLabelNode: cc.Node = null; // Узел для отображения метки "Идеально"

    public score: number = 0; // Текущий счет
    public bestScore: number = 0; // Лучший счет

    /**
     * Увеличивает счет и, если это бонус, показывает анимацию метки "Идеально".
     * @param {boolean} isBonus - Указывает, является ли увеличение счета бонусом.
     */
    increaseScore(isBonus: boolean = false) {
        this.score++; // Увеличиваем текущий счет на 1

        if (isBonus) {
            this.perfectLabelNode.active = true; // Активируем узел метки "Идеально"
            this.perfectLabelNode.runAction(cc.sequence( // Запускаем последовательность анимации
                cc.moveBy(0.5, cc.v2(0, 50)), // Поднимаем метку вверх
                cc.fadeIn(0.3), // Появление метки
                cc.delayTime(0.5), // Задержка перед исчезновением
                cc.fadeOut(0.3), // Исчезновение метки
                cc.moveBy(0.3, cc.v2(0, -50)), // Опускаем метку вниз
            ));
        }
        this.updateScore(); // Обновляем отображаемый счет
    }

    /**
     * Сохраняет лучший счет, если текущий счет выше.
     */
    saveBestScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score; // Обновляем лучший счет
            console.log('Новый лучший счет:', this.bestScore);
        }
    }

    /**
     * Обновляет отображаемый счет.
     */
    updateScore() {
        this.scoreTextNode.getComponent(cc.Label).string = this.score.toString(); // Обновляем текстовое представление счета
    }

    /**
     * Сбрасывает счет до нуля и обновляет отображение.
     */
    resetScore() {
        this.score = 0; // Сбрасываем счет
        this.updateScore(); // Обновляем отображение счета
    }
}