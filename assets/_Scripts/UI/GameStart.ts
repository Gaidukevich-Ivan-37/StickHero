import { PlayerStates } from "../Core/States/PlayerStates";
import AudioController from "./AudioController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameStart extends cc.Component {

    @property(cc.Node)
    gameStartButton: cc.Node = null; // Узел для кнопки начала игры

    @property(cc.Node)
    playerStub: cc.Node = null; // Узел для отображения игрока

    @property(cc.Node)
    platformStub: cc.Node = null; // Узел для платформы

    @property(cc.Animation)
    animation: cc.Animation = null; // Анимация для игрока

    @property(cc.Node)
    soundToggleButton: cc.Node = null; // Узел для кнопки переключения звука

    @property(cc.SpriteFrame)
    soundOnSprite: cc.SpriteFrame = null; // Спрайт для включенного звука

    @property(cc.SpriteFrame)
    soundOffSprite: cc.SpriteFrame = null; // Спрайт для выключенного звука

    @property(cc.Sprite)
    backgroundSprite: cc.Sprite = null; // Узел для основного фона

    @property(cc.SpriteFrame)
    Background: cc.SpriteFrame = null; // Спрайт для фона 1

    @property(cc.SpriteFrame)
    Background1: cc.SpriteFrame = null; // Спрайт для фона 2

    private audioController: AudioController = null; // Переменная для управления аудио
    animationTime: number = 0.5; // Время анимации

    protected onLoad(): void {
        cc.director.preloadScene("GameScene"); // Предварительная загрузка сцены игры

        if (this.gameStartButton) {
            this.gameStartButton.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this); // Слушаем событие касания для кнопки начала игры
        }

        if (this.soundToggleButton) {
            this.soundToggleButton.on(cc.Node.EventType.TOUCH_END, this.onSoundToggleButtonClicked, this); // Слушаем событие касания для кнопки переключения звука
        }
    }

    protected start(): void {
        this.animation.play(PlayerStates.Idle); // Запускаем анимацию состояния покоя
        this.audioController = AudioController.getInstance(); // Получаем экземпляр AudioController
        this.updateSoundButtonSprite(); // Обновляем спрайт кнопки звука в зависимости от состояния

        // Проверяем, назначен ли backgroundSprite
        if (!this.backgroundSprite) {
            cc.error('Background sprite is not assigned!'); // Выводим ошибку, если спрайт фона не назначен
            return;
        }
    
        // Устанавливаем фон только один раз при старте
        if (!this.backgroundSprite.spriteFrame) {
            const randomChoice = Math.random() < 0.5 ? this.Background : this.Background1; // Случайный выбор фона
            this.backgroundSprite.spriteFrame = randomChoice; // Устанавливаем выбранный фон
        }
    }

    /**
     * Обработчик события касания кнопки начала игры.
     */
    onTouchEnd() {
        this.soundToggleButton.active = false; // Скрываем кнопку переключения звука
        this.gameStartButton.active = false; // Скрываем кнопку начала игры

        this.audioController.playSound(this.audioController.buttonClickSound); // Воспроизводим звук нажатия кнопки
        const targetPlatformPosition = cc.v2(-cc.winSize.width / 2, this.platformStub.y); // Целевая позиция для платформы
        const targetPlayerPosition = cc.v2(this.platformStub.width / 2 - this.playerStub.width / 1.2, this.playerStub.y); // Целевая позиция для игрока

        const movePlatformStub = cc.moveTo(this.animationTime, targetPlatformPosition); // Действие для перемещения платформы
        const movePlayerStub = cc.moveTo(this.animationTime, targetPlayerPosition); // Действие для перемещения игрока

        this.platformStub.runAction(movePlatformStub); // Запускаем анимацию перемещения платформы
        this.playerStub.runAction(movePlayerStub); // Запускаем анимацию перемещения игрока

        this.scheduleOnce(() => {
            cc.director.loadScene('GameScene'); // Загружаем сцену игры после завершения анимации
        }, this.animationTime);
    }

    /**
     * Обработчик события касания кнопки переключения звука.
     */
    onSoundToggleButtonClicked() {
        this.audioController.toggleSound(); // Переключаем состояние звука
        this.updateSoundButtonSprite(); // Обновляем спрайт кнопки звука
    }

    /**
     * Обновляет спрайт кнопки переключения звука в зависимости от состояния звука.
     */
    updateSoundButtonSprite() {
        this.audioController.playSound(this.audioController.buttonClickSound); // Воспроизводим звук нажатия кнопки
        const sprite = this.soundToggleButton.getComponent(cc.Sprite); // Получаем компонент спрайта кнопки звука
        if (this.audioController.IsMuted) {
            sprite.spriteFrame = this.soundOffSprite; // Устанавливаем спрайт для выключенного звука
        } else {
            sprite.spriteFrame = this.soundOnSprite; // Устанавливаем спрайт для включенного звука
        }
    }
}