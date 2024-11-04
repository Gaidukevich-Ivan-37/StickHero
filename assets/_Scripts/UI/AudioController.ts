const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioController extends cc.Component {
    private static instance: AudioController = null; // Статическая переменная для хранения единственного экземпляра AudioController

    @property({ type: cc.AudioClip, displayName: 'Background Music', tooltip: 'Audio clip for background music' })
    backgroundMusic: cc.AudioClip = null; // Клип фоновой музыки

    @property(cc.AudioClip)
    fallSound: cc.AudioClip = null; // Звук падения

    @property(cc.AudioClip)
    stickGrowSound: cc.AudioClip = null; // Звук роста палки

    @property(cc.AudioClip)
    stickHitSound: cc.AudioClip = null; // Звук удара палки

    @property(cc.AudioClip)
    stickFallSound: cc.AudioClip = null; // Звук падения палки

    @property(cc.AudioClip)
    bonusSound: cc.AudioClip = null; // Звук бонуса

    @property(cc.AudioClip)
    skuCollectSound: cc.AudioClip = null; // Звук сбора предметов

    @property(cc.AudioClip)
    platformSound: cc.AudioClip = null; // Звук платформы

    @property(cc.AudioClip)
    buttonClickSound: cc.AudioClip = null; // Звук нажатия кнопки

    private musicId: number = -1; // Идентификатор фоновой музыки
    private stickGrowSoundId: number = -1; // Идентификатор звука роста палки
    public IsMuted: boolean = false; // Флаг, указывающий, отключен ли звук

    onLoad() {
        // Проверяем, существует ли уже экземпляр AudioController
        if (AudioController.instance === null) {
            AudioController.instance = this; // Устанавливаем текущий экземпляр
            cc.game.addPersistRootNode(this.node); // Сохраняем объект в корне сцены
            this.playBackgroundMusic(); // Начинаем воспроизведение фоновой музыки
        } else {
            this.node.destroy(); // Уничтожаем новый экземпляр, если уже существует
        }
    }

    /**
     * Воспроизводит фоновую музыку.
     */
    playBackgroundMusic() {
        if (!this.IsMuted && this.musicId === -1 && this.backgroundMusic) {
            console.log("Playing background music:", this.backgroundMusic);
            this.musicId = cc.audioEngine.playMusic(this.backgroundMusic, true); // Воспроизводим музыку в цикле
        }
    }

    /**
     * Останавливает фоновую музыку.
     */
    stopBackgroundMusic() {
        if (this.musicId !== -1) {
            cc.audioEngine.stopMusic(); // Останавливаем музыку
            this.musicId = -1; // Сбрасываем идентификатор музыки
        }
    }

    /**
     * Воспроизводит звуковой эффект.
     * @param {cc.AudioClip} sound - Аудиоклип для воспроизведения.
     */
    playSound(sound: cc.AudioClip) {
        if (!this.IsMuted && sound) {
            cc.audioEngine.playEffect(sound, false); // Воспроизводим звуковой эффект
        }
    }

    /**
     * Воспроизводит звук роста палки.
     */
    playStickGrowSound() {
        if (!this.IsMuted && this.stickGrowSound && this.stickGrowSoundId === -1) {
            this.stickGrowSoundId = cc.audioEngine.playEffect(this.stickGrowSound, true); // Воспроизводим звук роста палки
        }
    }

    /**
     * Останавливает звук роста палки.
     */
    stopStickGrowSound() {
        if (this.stickGrowSoundId !== -1) {
            cc.audioEngine.stopEffect(this.stickGrowSoundId); // Останавливаем звук
            this.stickGrowSoundId = -1; // Сбрасываем идентификатор звука
        }
    }

    /**
     * Отключает все звуки.
     */
    mute() {
        this.IsMuted = true; // Устанавливаем флаг в true
        cc.audioEngine.setMusicVolume(0); // Устанавливаем громкость музыки в 0
        cc.audioEngine.setEffectsVolume(0); // Устанавливаем громкость эффектов в 0
    }

    /**
     * Включает все звуки.
     */
    unmute() {
        this.IsMuted = false; // Устанавливаем флаг в false
        cc.audioEngine.setMusicVolume(1); // Восстанавливаем громкость музыки
        cc.audioEngine.setEffectsVolume(1); // Восстанавливаем громкость эффектов
    }

    /**
     * Переключает звук вкл/выкл.
     */
    toggleSound() {
        if (this.IsMuted) {
            this.unmute(); // Если звук выключен, включаем его
        } else {
            this.mute(); // Если звук включен, выключаем его
        }
    }

    /**
     * Возвращает экземпляр AudioController.
     * @returns {AudioController} - Экземпляр AudioController.
     */
    static getInstance(): AudioController {
        if (!AudioController.instance) {
            console.error("AudioManager instance is null."); // Сообщение об ошибке, если экземпляр не найден
        }
        return AudioController.instance; // Возвращаем экземпляр
    }
}