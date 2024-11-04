const { ccclass, property } = cc._decorator;

@ccclass
export default class SkuCounter extends cc.Component {
    @property(cc.Label)
    skuLabel: cc.Label = null; // Узел для отображения количества SKU

    private skuCount: { [key: string]: number } = {}; // Основное количество SKU
    private tempSkuCount: { [key: string]: number } = {}; // Временное количество SKU для текущей сессии

    onLoad() {
        if (!this.skuLabel) {
            cc.error('SkuCounter: skuLabel не назначен!'); // Проверка наличия назначенного узла для отображения SKU
        }
        this.loadSkuCount(); // Загружаем количество SKU из локального хранилища
        this.updateLabel(); // Обновляем отображение
    }

    /**
     * Увеличивает количество SKU для заданного типа.
     * @param {string} type - Тип SKU, который нужно увеличить.
     */
    increaseSkuCount(type: string) {
        if (!this.tempSkuCount[type]) {
            this.tempSkuCount[type] = 0; // Инициализируем временное количество SKU, если оно отсутствует
        }
        this.tempSkuCount[type]++; // Увеличиваем временное количество SKU
        this.updateLabel(); // Обновляем отображение
    }

    /**
     * Сохраняет временное количество SKU в основное количество и сохраняет в локальном хранилище.
     */
    saveSkuCount() {
        for (let key in this.tempSkuCount) {
            if (!this.skuCount[key]) {
                this.skuCount[key] = 0; // Инициализируем основное количество SKU, если оно отсутствует
            }
            this.skuCount[key] += this.tempSkuCount[key]; // Добавляем временное количество к основному
        }
        this.tempSkuCount = {}; // Очищаем временное количество SKU
        cc.sys.localStorage.setItem('skuCount', JSON.stringify(this.skuCount)); // Сохраняем основное количество SKU в локальном хранилище
        this.updateLabel(); // Обновляем отображение
    }

    /**
     * Сбрасывает временное количество SKU.
     */
    resetSkuCount() {
        this.tempSkuCount = {}; // Очищаем временное количество SKU
        this.updateLabel(); // Обновляем отображение
    }

    /**
     * Обновляет метку SKU с текущим количеством SKU.
     */
    private updateLabel() {
        this.skuLabel.string = `${this.skuCount['Bonus'] || 0 + this.tempSkuCount['Bonus'] || 0}`; // Обновляем текст метки с учетом основного и временного количества SKU
    }

    /**
     * Загружает количество SKU из локального хранилища.
     */
    private loadSkuCount() {
        const savedSkuCount = cc.sys.localStorage.getItem('skuCount'); // Получаем сохраненное количество SKU из локального хранилища
        if (savedSkuCount) {
            this.skuCount = JSON.parse(savedSkuCount); // Парсим сохраненные данные
        } else {
            this.skuCount = {}; // Если данных нет, инициализируем как пустой объект
        }
    }
}