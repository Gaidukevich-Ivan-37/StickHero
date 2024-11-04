import { GameStates } from "./States/GameStates"; // Импорт состояний игры
import Stick from './Stick'; // Импорт компонента Stick
import Platform from './Platform'; // Импорт компонента Platform
import Player from './Player'; // Импорт компонента Player
import EndGamePopup from "../UI/EndGamePopup"; // Импорт всплывающего окна конца игры
import ScoreController from "../UI/ScoreController"; // Импорт контроллера очков
import AudioController from "../UI/AudioController"; // Импорт аудиоконтроллера
import { PlayerStates } from "./States/PlayerStates"; // Импорт состояний игрока
import BonusItem from "./BonusItem"; // Импорт бонусного элемента
import SkuCounter from "../UI/SkuCounter"; // Импорт счетчика скинов
import { log } from '../../../creator'; // Импорт логирования

const { ccclass, property } = cc._decorator; // Декораторы для класса и его свойств

@ccclass
export default class GameplayController extends cc.Component {
    // Определение свойств с их описанием для редактора Cocos Creator

    @property({ type: cc.Node, displayName: 'RootNode', tooltip: "Где размещаются все игровые объекты" })
    rootNode: cc.Node = null; // Узел корня сцены

    @property({ type: cc.Node, displayName: 'Default Position', tooltip: 'Позиция по умолчанию для игрока и платформы после успешного перехода' })
    defaultPosition: cc.Node = null; // Позиция по умолчанию

    @property({ type: cc.Prefab, displayName: 'StickPrefab', tooltip: 'Префаб палки' })
    stickPrefab: cc.Prefab = null; // Префаб для создания палок

    @property({ type: cc.Prefab, displayName: 'PlatformPrefab', tooltip: 'Префаб платформы' })
    platformPrefab: cc.Prefab = null; // Префаб для создания платформ

    @property({ type: cc.Prefab, displayName: 'PlayerPrefab', tooltip: 'Префаб игрока' })
    playerPrefab: cc.Prefab = null; // Префаб для создания игрока

    @property({ type: cc.Prefab, displayName: 'Bonus Item Prefab', tooltip: 'Префаб для бонусного элемента' })
    bonusItemPrefab: cc.Prefab = null; // Префаб для бонусных элементов

    @property({ type: cc.Float, displayName: 'Player Prefab Width', tooltip: 'Необходимо для расчета начальной позиции игрока' })
    playerPrefabWidth: number = 45; // Ширина префаба игрока

    @property({ type: cc.Float, displayName: 'Platform Prefab Width', tooltip: 'Необходимо для расчета начальной позиции платформы' })
    platformPrefabWidth: number = 300; // Ширина префаба платформы

    @property({ type: cc.Prefab, displayName: 'End Game Popup Prefab', tooltip: 'Префаб для всплывающего окна конца игры' })
    endGamePopupPrefab: cc.Prefab = null; // Префаб всплывающего окна конца игры

    @property({ type: cc.Node, displayName: 'UI Node', tooltip: 'Узел для UI-элементов' })
    uiNode: cc.Node = null; // Узел для UI элементов

    @property({ type: cc.Node, displayName: 'Score Node', tooltip: 'Узел, отображающий текущий счет' })
    scoreNode: cc.Node = null; // Узел для отображения счета

    // Приватные переменные для хранения объектов и компонентов сцены
    private endGamePopupInstance: cc.Node = null; // Экземпляр всплывающего окна конца игры
    private platformNode: cc.Node = null; // Текущая платформа
    private nextPlatformNode: cc.Node = null; // Следующая платформа
    private oldStickNode: cc.Node = null; // Ссылка на старую палку
    private stickNode: cc.Node = null; // Текущая палка
    private playerNode: cc.Node = null; // Игрок
    private bonusItemNode: cc.Node = null; // Бонусный элемент
    private stickComponent: Stick = null; // Компонент палки
    private endGamePopupComponent: EndGamePopup = null; // Компонент всплывающего окна конца игры
    private scoreController: ScoreController = null; // Компонент контроллера счета
    private audioController: AudioController = null; // Компонент аудиоконтроллера
    private skuCounter: SkuCounter = null; // Компонент счетчика скинов

    // Объект для хранения деталей движения
    private moveDetails = {
        distance: 0, // Расстояние
        startX: 0, // Начальная позиция по X
        targetX: 0, // Целевая позиция по X
        duration: 0, // Продолжительность движения
        elapsedTime: 0, // Время, прошедшее с начала движения
        callback: null, // Функция обратного вызова
    };

    GameState = GameStates.Idle; // Начальное состояние игры
    futurePlatformPosition: number; // Позиция для следующей платформы

    // Метод, вызываемый при загрузке сцены
    protected onLoad(): void {
        console.log("GameplayController onLoad"); // Вывод сообщения в консоль

        cc.director.getCollisionManager().enabled = true; // Включение менеджера столкновений

        // Создание и добавление всплывающего окна конца игры
        this.endGamePopupInstance = cc.instantiate(this.endGamePopupPrefab);
        this.uiNode.addChild(this.endGamePopupInstance);
        this.endGamePopupComponent = this.endGamePopupInstance.getComponent(EndGamePopup);

        // Получение компонента контроллера очков и счетчика скинов
        this.scoreController = cc.find('Canvas/UI/Score').getComponent(ScoreController);
        this.skuCounter = cc.find('Canvas/UI/SkuCounter').getComponent(SkuCounter);

        // Получение экземпляра аудиоконтроллера
        this.audioController = AudioController.getInstance();

        // Инициализация игрового экземпляра и событий касания
        this.initializeGameInstance();
        this.initTouchEvents();
    }
    // Инициализация игрового экземпляра с установкой начальных позиций для платформ и игрока
    initializeGameInstance() {
    console.log("initializeGameInstance");
    // Начальная позиция первой платформы
    const initialPlatformX = -cc.winSize.width / 2;
    // Начальная позиция игрока с учетом ширины платформы и игрока
    const initialPlayerX = initialPlatformX + this.platformPrefabWidth / 2 - this.playerPrefabWidth / 1.2;

    // Создание первой платформы
    this.platformNode = this.createPlatform(initialPlatformX, this.platformPrefabWidth, false);
    // Удаление коллайдера с первой платформы, чтобы избежать столкновения с игроком
    this.platformNode.getComponent(cc.BoxCollider).destroy();

    // Сохранение позиции для следующей платформы
    this.futurePlatformPosition = this.platformNode.x;

    // Создание игрока
    this.playerNode = this.createPlayer(initialPlayerX);
    // Спавн следующей платформы
    this.spawnNextPlatform();

    // Установка состояния игры в "Idle"
    this.setState(GameStates.Idle, 'initializeGameInstance');
}

// Вычисление позиции для следующей платформы
calculateNextPlatformPosition(): number {
    let offset = 50; // Смещение от края экрана
    const minDistance = 200; // Минимальное расстояние между платформами
    const maxDistance = cc.winSize.width - this.platformPrefabWidth - offset; // Максимальное расстояние с учетом ширины платформы

    // Случайное расстояние в пределах между минимальным и максимальным значениями
    let randomDistance = minDistance + Math.random() * (maxDistance - minDistance);
    let targetX = this.defaultPosition.x + randomDistance; // Позиция X для следующей платформы

    return targetX;
}

// Вычисление позиции для следующего бонусного элемента
calculateNextBonusItemPosition(targetXPlatform: number): number {
    const minOffset = 50; // Минимальное смещение
    const currentPlatformRightEdge = this.futurePlatformPosition + this.platformNode.width / 2 + minOffset; // Правая граница текущей платформы
    const nextPlatformLeftEdge = targetXPlatform - this.nextPlatformNode.width / 2 - minOffset; // Левая граница следующей платформы

    // Случайная позиция X для бонусного элемента между платформами
    const targetX = currentPlatformRightEdge + Math.random() * (nextPlatformLeftEdge - currentPlatformRightEdge);

    return targetX;
}

// Спавн следующей платформы
spawnNextPlatform() {
    console.log("spawnNextPlatform");
    const spawnX = cc.winSize.width; // Позиция для появления новой платформы за экраном
    const targetXPlatform = this.calculateNextPlatformPosition(); // Расчет позиции для платформы
    this.nextPlatformNode = this.createPlatform(spawnX, 0, true); // Создание следующей платформы

    const targetXBonusItem = this.calculateNextBonusItemPosition(targetXPlatform); // Расчет позиции для бонусного элемента

    // Спавн бонусного элемента, если счет больше или равен 2
    if (this.scoreController.score >= 2) {
        if (Math.random() < 0.8) // Вероятность 80% для спавна бонусного элемента (SKU)
            this.bonusItemNode = this.createBonusItem(spawnX);
    }

    // Перемещение платформы и бонусного элемента на экран
    this.movePlatformOntoScreen(this.nextPlatformNode, this.bonusItemNode, targetXPlatform, targetXBonusItem);
}

// Создание бонусного элемента в заданной позиции
createBonusItem(spawnX: number): cc.Node {
    console.log('createBonusItem');
    let bonusItemInstance = cc.instantiate(this.bonusItemPrefab); // Создание экземпляра префаба бонусного элемента
    bonusItemInstance.zIndex = 996; // Установка z-индекса для отображения поверх других элементов
    this.rootNode.addChild(bonusItemInstance); // Добавление бонусного элемента в корневой узел
    const bonusItemComp = bonusItemInstance.getComponent(BonusItem); // Получение компонента бонусного элемента
    if (bonusItemComp) {
        bonusItemComp.initPlatform(spawnX); // Инициализация позиции бонусного элемента
    } else {
        console.error("Platform component is missing"); // Сообщение об ошибке, если компонент отсутствует
    }
    return bonusItemInstance;
}

// Перемещение платформы и бонусного элемента на экран
movePlatformOntoScreen(platformNode: cc.Node, bonusItemNode: cc.Node, targetXPlatform: number, targetXBonusItem: number) {
    console.log("movePlatformOntoScreen", platformNode, targetXPlatform, bonusItemNode, targetXBonusItem);

    // Анимация перемещения платформы на экран
    cc.tween(platformNode)
        .to(0.5, { x: targetXPlatform }) // Перемещение за 0.5 секунды
        .start();

    // Анимация перемещения бонусного элемента на экран
    cc.tween(this.bonusItemNode)
        .to(0.25, { x: targetXBonusItem }) // Перемещение за 0.25 секунды
        .start();
}

// Создание платформы в заданной позиции
createPlatform(positionX: number, initialWidth: number = 0, bonusVisible: boolean = true): cc.Node {
    console.log("createPlatform", positionX, initialWidth);

    // Создание экземпляра префаба платформы
    let platformInstance = cc.instantiate(this.platformPrefab);
    platformInstance.zIndex = 997; // Установка z-индекса для правильного отображения на слое
    this.rootNode.addChild(platformInstance); // Добавление платформы в корневой узел
    const platformComp = platformInstance.getComponent(Platform); // Получение компонента Platform
    if (platformComp) {
        // Инициализация платформы с заданными параметрами
        platformComp.initPlatform(positionX, initialWidth, bonusVisible);
        // Добавление события для обработки столкновения с бонусной платформой
        platformComp.node.on('bonusPlatformTouched', this.onBonusPlatformTouched, this);
    } else {
        console.error("Platform component is missing"); // Сообщение об ошибке, если компонент отсутствует
    }
    return platformInstance; // Возврат созданной платформы
}

// Создание игрока в заданной позиции
createPlayer(positionX: number): cc.Node {
    console.log("createPlayer");

    // Создание экземпляра префаба игрока
    let playerInstance = cc.instantiate(this.playerPrefab);
    playerInstance.zIndex = 998; // Установка z-индекса для отображения игрока поверх платформ
    this.rootNode.addChild(playerInstance); // Добавление игрока в корневой узел
    const playerComp = playerInstance.getComponent(Player); // Получение компонента Player
    if(playerComp) {
        // Добавление события для обработки сбора бонуса
        playerComp.node.on('playCollectBonus', this.playCollectBonus, this);
    }
    // Установка позиции игрока на платформе
    playerInstance.setPosition(positionX, this.platformNode.y + this.platformNode.height / 2 + playerInstance.height / 2);
    return playerInstance; // Возврат созданного игрока
}

// Метод обновления для обработки состояния игры и движений
protected update(deltaTime: number): void {
    // Если состояние игры - "Touching" и есть активная палка, продолжаем ее рост
    if (this.GameState === GameStates.Touching && this.stickNode) {
        this.stickNode.getComponent(Stick).growStick(deltaTime);
    }
    
    // Если состояние игры - "Running" или "Coming" и целевая позиция движения не равна 0
    if (this.GameState === GameStates.Running || this.GameState === GameStates.Coming 
            && this.moveDetails.targetX !== 0) {
        // Обновление прошедшего времени движения
        this.moveDetails.elapsedTime += deltaTime;
        // Расчет прогресса движения
        let progress = Math.min(this.moveDetails.elapsedTime / this.moveDetails.duration, 1);
        // Интерполяция новой позиции игрока
        const newPositionX = cc.misc.lerp(this.moveDetails.startX, this.moveDetails.targetX, progress);
        this.playerNode.setPosition(newPositionX, this.playerNode.position.y);

        // Если движение завершено
        if (progress >= 1 ) {
            this.setState(GameStates.End, 'update'); // Переход в состояние "End"
            this.moveDetails.targetX = 0;
            if (this.moveDetails.callback) {
                this.moveDetails.callback(); // Выполнение коллбэка, если он есть
            }
        }

        // Проверка, достиг ли игрок следующей платформы
        if (this.playerNode.x >= this.nextPlatformNode.x - this.nextPlatformNode.width / 2 && this.GameState === GameStates.Running) {
            this.setState(GameStates.Coming, 'update'); // Переход в состояние "Coming"
        }
    }

    // Проверка, если состояние игрока - "Crash"
    if (this.playerNode.getComponent(Player).getState() === PlayerStates.Crash) {
        this.onPlayerCrashInToPlatform(); // Обработка столкновения игрока с платформой
    }
}

// Обработка события окончания касания
onTouchEnd() {
    console.log("onTouchEnd");

    // Проверка, прошел ли игрок текущую платформу, чтобы предотвратить переворот, если игрок на платформе
    let playerPassCurrentPlatform = this.playerNode.x >= this.platformNode.x + this.platformNode.width / 2;
    
    // Если состояние игры - "Running" и игрок прошел текущую платформу
    if (this.GameState === GameStates.Running && this.playerNode && playerPassCurrentPlatform) {
        this.playerNode.getComponent(Player).flipPlayer(); // Переворот игрока
        return;
    }

    // Проверка, что состояние игры - "Touching" и есть активная палка
    if (this.GameState !== GameStates.Touching || !this.stickNode) {
        return;
    }

    // Получение компонента палки
    this.stickComponent = this.stickNode.getComponent(Stick);

    if (this.stickComponent) {
        // Остановка роста палки
        this.stickComponent.stopStickGrowth();
        // Установка состояния игрока на "HitStick"
        this.playerNode.getComponent(Player).setState(PlayerStates.HitStick);
        // Падение палки
        this.stickComponent.stickFall();

        // Управление звуками
        if (!this.audioController.IsMuted) {
            this.audioController.stopStickGrowSound(); // Остановка звука роста палки
            this.audioController.playSound(this.audioController.stickHitSound); // Воспроизведение звука удара
        }

        this.setState(GameStates.End); // Переход в состояние "End"

        // Запланированная проверка результата после падения палки
        this.scheduleOnce(this.checkResult.bind(this), this.stickComponent.angleTime);
    } else {
        console.error("Stick component is missing"); // Сообщение об ошибке, если компонент отсутствует
    }
}

// Сохранение количества SKU
saveSkuCount() {
    if (this.skuCounter) {
        // Сохранение значения счётчика SKU
        this.skuCounter.saveSkuCount();
    } else {
        console.error("SKU counter is missing"); // Сообщение об ошибке, если компонент счётчика SKU отсутствует
    }
}

// Сброс количества SKU
resetSkuCount() {
    if (this.skuCounter) {
        // Сброс значения счётчика SKU
        this.skuCounter.resetSkuCount();
    } else {
        console.error("SKU counter is missing"); // Сообщение об ошибке, если компонент счётчика SKU отсутствует
    }
}

// Инициализация событий касания
initTouchEvents() {
    console.log("initTouchEvents");
    // Обработка события начала касания
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    // Обработка события окончания касания
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
}

// Создание палки для игрока
createStick() {
    console.log("createStick");
    // Создание экземпляра префаба палки
    this.stickNode = cc.instantiate(this.stickPrefab);
    this.stickNode.zIndex = 998; // Установка z-индекса для правильного отображения
    this.rootNode.addChild(this.stickNode); // Добавление палки в корневой узел
    // Установка позиции палки рядом с платформой
    this.stickNode.setPosition(this.platformNode.x + this.platformNode.width / 2, this.platformNode.y + this.platformNode.height / 2);
    this.stickNode.height = 0; // Начальная высота палки
    this.stickNode.angle = 0; // Начальный угол палки
}

// Обработка события начала касания
onTouchStart() {
    console.log("onTouchStart", this.GameState);
    // Проверка, что текущее состояние игры - "Idle"
    if (this.GameState !== GameStates.Idle) {
        return;
    }
    this.setState(GameStates.Touching); // Установка состояния игры в "Touching"
    this.createStick(); // Создание новой палки
    this.stickComponent = this.stickNode.getComponent(Stick); // Получение компонента Stick
    if (this.stickComponent) {
        this.stickComponent.startStickGrowth(); // Начало роста палки
        this.playerNode.getComponent(Player).setState(PlayerStates.StickGrow); // Установка состояния игрока

        // Воспроизведение звука роста палки, если звук не отключён
        if (!this.audioController.IsMuted)
            this.audioController.playStickGrowSound();
    } else {
        console.error("Stick component is missing"); // Сообщение об ошибке, если компонент палки отсутствует
    }
}

// Перемещение игрока к целевой позиции
moveTo(targetPositionX: number, duration: number, onComplete: () => void) {
    // Сохранение начальной и целевой позиции, длительности и коллбэка
    this.moveDetails.startX = this.playerNode.position.x;
    this.moveDetails.targetX = targetPositionX;
    this.moveDetails.duration = duration;
    this.moveDetails.elapsedTime = 0;
    this.moveDetails.callback = onComplete;
    this.setState(GameStates.Running); // Установка состояния игры в "Running"
    this.playerNode.getComponent(Player).setState(PlayerStates.Running); // Установка состояния игрока
}

// Проверка, достигла ли палка платформы
checkResult() {
    console.log("checkResult");
    if (!this.stickNode) {
        return;
    }

    // Расчёт правой координаты палки
    const stickRightX = this.stickNode.x + this.stickNode.height;
    const nextPlatformComp = this.nextPlatformNode.getComponent(Platform); // Получение компонента следующей платформы

    // Проверка, касается ли палка следующей платформы
    if (nextPlatformComp && nextPlatformComp.isStickTouching(stickRightX)) {
        if (!this.audioController.IsMuted)
            this.audioController.playSound(this.audioController.stickFallSound); // Воспроизведение звука падения палки

        this.onStickTouchPlatform(); // Обработка успешного касания платформы
    } else {
        this.onFailed(); // Обработка неудачи, если палка не достигла платформы
    }
}

// Обработка успешного касания палки платформы
onStickTouchPlatform() {
    console.log("onStickTouchPlatform");
    // Вычисление точки на платформе для перемещения игрока
    let nextPlatformEdge = this.nextPlatformNode.x + this.nextPlatformNode.width / 3;

    // Расчёт расстояния и времени перемещения
    this.moveDetails.distance = nextPlatformEdge - this.playerNode.x;
    let moveTime = Math.abs(this.moveDetails.distance / 500);

    // Перемещение игрока
    this.moveTo(nextPlatformEdge, moveTime, () => {
        // После завершения перемещения выполнение дополнительных действий
        this.scheduleOnce(() => {
            this.saveSkuCount(); // Сохранение количества SKU
            this.resetPlatformsAndPlayer(); // Сброс платформ и игрока
            this.instantiateNextPlatform(); // Создание следующей платформы
        });
        this.setState(GameStates.Idle, 'onStickTouchPlatform'); // Переход в состояние "Idle"
        this.playerNode.getComponent(Player).setState(PlayerStates.Idle); // Установка состояния игрока
    });
}

// Сброс платформ и позиции игрока
resetPlatformsAndPlayer() {
    console.log("resetPlatformsAndPlayer");

    // Расчёт смещения и времени перемещения
    let moveAmount = -cc.winSize.width / 3;
    let moveTime = 0.1;

    // Определение новой позиции для следующей платформы
    this.futurePlatformPosition = moveAmount - this.nextPlatformNode.width / 2 + this.playerNode.width / 1.3;

    // Анимация перемещения следующей платформы
    cc.tween(this.nextPlatformNode)
        .to(moveTime, { x: this.futurePlatformPosition })
        .start();

    // Анимация перемещения игрока
    cc.tween(this.playerNode)
        .to(moveTime, { x: moveAmount })
        .start();

    // Проверка наличия узла палки и её перемещение
    if (this.stickNode) {
        let futureStickPosition = moveAmount - this.nextPlatformNode.x - this.nextPlatformNode.width / 2 + this.playerNode.width / 1.3;
        cc.tween(this.stickNode)
            .to(moveTime, { x: this.stickNode.x + futureStickPosition })
            .start();
    }

    // Воспроизведение звука платформы, если звук не отключён
    if (!this.audioController.IsMuted)
        this.audioController.playSound(this.audioController.platformSound);

    // Удаление текущей платформы и установка новой
    this.platformNode.destroy();
    this.platformNode = null;
    this.platformNode = this.nextPlatformNode;
    this.platformNode.getComponent(cc.BoxCollider).destroy(); // Удаление коллайдера для предотвращения столкновений игрока с ней

    // Скрытие бонусной платформы, если компонент платформы присутствует
    const platformComp = this.platformNode.getComponent(Platform);
    if (platformComp) {
        platformComp.setBonusPlatformVisibility(false);
    } else {
        console.error("Platform component is missing");
    }

    // Удаление старого узла палки, если он существует
    if(this.oldStickNode) {
        this.oldStickNode.destroy();
        this.oldStickNode = null;
    }
    this.oldStickNode = this.stickNode; // Присвоение текущей палки в старую палку
    this.stickNode = null;

    // Удаление узла бонусного предмета, если он существует
    if (this.bonusItemNode) {
        this.bonusItemNode.destroy();
    }

    // Увеличение счёта после успешного перехода на следующую платформу
    this.scoreController.increaseScore(false);
}

// Обработка неудачи игрока
onFailed() {
    console.log("onFailed");
    // Расчёт расстояния и времени перемещения
    let moveLength = this.stickNode.x + this.stickNode.height - this.playerNode.x;
    let moveTime = Math.abs(moveLength / 500);

    // Перемещение игрока к краю палки перед падением
    this.moveTo(this.stickNode.x + this.stickNode.height, moveTime, () => {
        this.playerNode.getComponent(Player).fall(); // Вызов падения игрока

        // Воспроизведение звука падения, если звук не отключён
        if (!this.audioController.IsMuted)
            this.audioController.playSound(this.audioController.fallSound);

        this.stickComponent.stickOnFail(); // Обработка неудачи палки
        this.scheduleOnce(() => {
            this.endGame(); // Завершение игры после задержки
        }, 1);
    });

    this.resetSkuCount(); // Сброс количества SKU после неудачи
}

// Обработка столкновения игрока с платформой
onPlayerCrashInToPlatform() {
    console.log("onPlayerCrashInToPlatform");
    this.playerNode.getComponent(Player).fall(); // Вызов падения игрока

    // Проверка состояния игры для предотвращения воспроизведения звука после завершения игры
    if (!this.audioController.IsMuted && this.GameState !== GameStates.End) 
        this.audioController.playSound(this.audioController.fallSound);

    this.setState(GameStates.End); // Установка состояния игры на "End"
    this.scheduleOnce(() => {
        this.endGame(); // Завершение игры после задержки
    }, 1);

    this.resetSkuCount(); // Сброс количества SKU
}

// Завершение игры
endGame() {
    console.log("endGame");
    this.setState(GameStates.End); // Установка состояния игры на "End"
    this.scoreController.saveBestScore(); // Сохранение лучшего счёта
    this.scoreNode.active = false; // Деактивация узла счёта
    // Показ всплывающего окна с текущим и лучшим счётом
    this.endGamePopupComponent.showPopup(this.scoreController.score, this.scoreController.bestScore);
}

// Перезапуск игры
restartGame() {
    console.log("restartGame");
    this.endGamePopupComponent.hidePopup(); // Скрытие всплывающего окна окончания игры
    this.scoreNode.active = true; // Активация узла счёта
    this.scoreController.resetScore(); // Сброс текущего счёта
    this.dispose(); // Очистка игровых объектов
    this.initializeGameInstance(); // Инициализация новой игровой сессии
}

// Очистка игровых объектов
dispose() {
    console.log("dispose");
    this.rootNode.removeAllChildren(); // Удаление всех дочерних узлов из rootNode, что очищает игровую сцену
}

// Создание следующей платформы
instantiateNextPlatform() {
    console.log("instantiateNextPlatform");
    this.spawnNextPlatform(); // Вызов метода для генерации новой платформы

    // Расчёт времени появления платформы в зависимости от расстояния
    let platformAppearanceTime = this.moveDetails.distance / (200 * 3);
    
    // Анимация перемещения узла для плавного перехода между платформами
    cc.tween(this.node)
        .to(platformAppearanceTime, { position: cc.v3(this.node.x - this.moveDetails.distance) })
        .start();
}

// Установка состояния игры
setState(state: GameStates, methodName: string = '') {
    // Проверка на изменение состояния игры
    if (this.GameState !== state) {
        this.GameState = state; // Установка нового состояния

        // Логирование нового состояния и имени вызвавшего метода для отладки
        cc.log('Game state:', state, 'Method:', methodName);
    }
}

/**
 * Обработка события касания бонусной платформы.
 */
onBonusPlatformTouched() {
    this.scoreController.increaseScore(true); // Увеличение счёта за касание бонусной платформы

    // Воспроизведение звука бонуса, если звук не отключён
    if (!this.audioController.IsMuted)
        this.audioController.playSound(this.audioController.bonusSound);
}

/**
 * Воспроизведение звука при сборе бонуса.
 */
playCollectBonus() {
    // Воспроизведение звука сбора бонуса, если звук не отключён
    if (!this.audioController.IsMuted)
        this.audioController.playSound(this.audioController.skuCollectSound);
}
}