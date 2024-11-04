import GameplayController from "../Core/GameplayController";
import AudioController from "./AudioController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EndGamePopup extends cc.Component {

    @property({ type: cc.Node, displayName: 'Restart Button', tooltip: 'Node that displays the restart button' })
    restartButton: cc.Node = null; // Узел для кнопки перезапуска

    @property({ type: cc.Node, displayName: 'Start Screen Button', tooltip: 'Node that displays the start screen button' })
    startScreenButton: cc.Node = null; // Узел для кнопки главного экрана

    @property({ type: cc.Node, displayName: 'Score Node', tooltip: 'Node that displays the score' })
    scoreNode: cc.Node = null; // Узел для отображения текущего счета

    @property({ type: cc.Node, displayName: 'Best Score Node', tooltip: 'Node that displays the best score' })
    bestScoreNode: cc.Node = null; // Узел для отображения лучшего счета

    @property({ type: cc.Node, displayName: 'Transition Node', tooltip: 'Node that displays the transition node' })
    transitionNode: cc.Node = null; // Узел для анимации перехода

    private audioController: AudioController = null; // Переменная для управления аудио

    protected onLoad(): void {
        this.node.active = false; // Делаем узел неактивным при загрузке
        this.node.zIndex = 999; // Устанавливаем zIndex для отображения поверх других узлов
        this.initTouchEvent(); // Инициализируем события касания
        this.audioController = AudioController.getInstance(); // Получаем экземпляр AudioController
    }

    /**
     * Инициализирует обработчики событий касания для кнопок.
     */
    initTouchEvent() {
        this.restartButton.on(cc.Node.EventType.TOUCH_END, this.onRestartTouched, this); // Слушаем событие касания для кнопки перезапуска
        this.startScreenButton.on(cc.Node.EventType.TOUCH_END, this.onStartScreenTouched, this); // Слушаем событие касания для кнопки главного экрана
    }

    /**
     * Обработчик события касания кнопки перезапуска.
     */
    onRestartTouched() {
        if (!this.audioController.IsMuted)
            this.audioController.playSound(this.audioController.buttonClickSound); // Воспроизводим звук нажатия кнопки, если звук не выключен

        this.node.active = false; // Скрываем всплывающее окно

        const gameplayController = cc.find('Canvas').getComponent(GameplayController); // Получаем компонент GameplayController
        gameplayController.restartGame(); // Перезапускаем игру
    }

    /**
     * Обработчик события касания кнопки главного экрана.
     */
    onStartScreenTouched() {
        if (!this.audioController.IsMuted)
            this.audioController.playSound(this.audioController.buttonClickSound); // Воспроизводим звук нажатия кнопки, если звук не выключен

        this.transitionNode.active = true; // Активируем узел перехода
        this.transitionNode.opacity = 0; // Устанавливаем начальную непрозрачность
        this.transitionNode.runAction(cc.sequence(
            cc.fadeIn(0.5), // Плавное появление узла
            cc.callFunc(() => {
                cc.director.loadScene('StartScene', () => { // Загружаем сцену "StartScene"
                    const transitionNode = cc.find('Canvas/TransitionBG'); // Находим узел перехода
                    if (transitionNode) {
                        transitionNode.opacity = 255; // Устанавливаем непрозрачность узла перехода
                        transitionNode.runAction(cc.fadeOut(0.5)); // Плавное исчезновение узла
                    }
                });
            })
        ));
    }

    /**
     * Отображает всплывающее окно окончания игры с заданным счетом и лучшим счетом.
     * @param {number} score - Текущий счет.
     * @param {number} bestScore - Лучший счет.
     */
    showPopup(score: number, bestScore: number) {
        this.node.active = true; // Активируем всплывающее окно

        this.node.setSiblingIndex(this.node.parent.childrenCount - 1); // Перемещаем всплывающее окно на верхний уровень
        this.scoreNode.getComponent(cc.Label).string = score.toString(); // Обновляем текст текущего счета
        this.bestScoreNode.getComponent(cc.Label).string = bestScore.toString(); // Обновляем текст лучшего счета
    }

    /**
     * Скрывает всплывающее окно окончания игры.
     */
    hidePopup() {
        this.node.active = false; // Скрываем всплывающее окно
    }

    /**
     * Активирует всплывающее окно окончания игры.
     */
    onGameEnd() {
        this.node.active = true; // Активируем всплывающее окно в конце игры
    }
}