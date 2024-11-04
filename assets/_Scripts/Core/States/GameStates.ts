// Объявляем и экспортируем перечисление (enum) GameStates.
export enum GameStates {
    /**
     * Состояние игры: бездействие (ожидание).
     */
    Idle = 'Idle',

    /**
     * Состояние игры: касание (например, когда игрок прикасается к экрану или нажимает кнопку).
     */
    Touching = 'Touching',

    /**
     * Состояние игры: выполнение действия, игра в процессе.
     */
    Running = 'Running',

    /**
     * Состояние игры: приближение (например, игрок или объект приближается к цели).
     */
    Coming = 'Coming',

    /**
     * Состояние перехода (завершение уровня или этапа игры).
     */
    End = 'End'
}