// Объявляем и экспортируем перечисление (enum) PlayerStates.
export enum PlayerStates {
    /**
     * Состояние игрока: бездействие (ожидание).
     */
    Idle = "PlayerIdle",

    /**
     * Состояние игрока: бег.
     */
    Running = "PlayerRun",

    /**
     * Состояние игрока: наращивание палки.
     */
    StickGrow = "PlayerStickGrow",

    /**
     * Состояние игрока: удар по палке.
     */
    HitStick = "PlayerHitStick",

    /**
     * Состояние игрока: падение.
     */
    Falling = "Falling",

    /**
     * Состояние игрока: столкновение с платформой.
     */
    Crash = "Crash"
}