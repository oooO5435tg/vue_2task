const storageKey = 'new';
const storageData = localStorage.getItem(storageKey);
const initialData = storageData ? JSON.parse(storageData) : {
    plannedTasks: [],
    progressTasks: [],
    completedTasks: []
};

new Vue({
    el: '#app',
    data: {
        plannedTasks: initialData.plannedTasks,
        progressTasks: initialData.progressTasks,
        completedTasks: initialData.completedTasks,
        newCardTitle: '',
        newCardItems: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }],
        column1Locked: false,
        column2Full1: false,
        column2Locked: false,
    },
    // mounted() {
    //     if (localStorage.getItem('notes')) {
    //         const savedData = JSON.parse(localStorage.getItem('notes'));
    //         this.column1 = savedData.column1;
    //         this.column2 = savedData.column2;
    //         this.column3 = savedData.column3;
    //         this.column1Locked = savedData.column1Locked;
    //         this.column2Full1 =  savedData.column2Full1;
    //     }
    // },
    methods: {
        addCard() {
            if (!this.newCardTitle) {
                alert('Необходимо указать заголовок задачи');
                return;
            }
            if (this.newCardTitle.trim() !== '') {
                if (this.column2Full1) {
                    alert("Нельзя добавить более 5 карточек во второй список");
                    return;
                }

                const filledItems = this.newCardItems.filter(item => item.text.trim() !== '');
                if (filledItems.length < 3) {
                    alert("Количество списков должно быть в диапазоне от 3 до 5");
                    return;
                }

                if (!this.column1Locked && this.plannedTasks.length < 3) {
                    this.plannedTasks.push({
                        title: this.newCardTitle,
                        items: filledItems
                    });
                } else {
                    alert("Нельзя добавить более 3 карточек в 1 столбец");
                    return;
                }
                this.newCardTitle = '';
                this.newCardItems = [
                    { text: '' },
                    { text: '' },
                    { text: '' },
                    { text: '' },
                    { text: '' }
                ];
                if (this.progressTasks.length < 5) {
                    this.column1Locked = false;
                }
            }
        },
        checkItem(card) {
            if (this.column1Locked) {
                return;
            }
            this.column2Full1 = false;
            const checkedCount = card.items.filter(item => item.checked).length;
            const totalCount = card.items.length;
            const completionPercentage = (checkedCount / totalCount) * 100;

            if (completionPercentage >= 50 && this.plannedTasks.includes(card)) {
                if (this.progressTasks.length < 5) {
                    this.moveCardToSecondColumn(card);
                } else {
                    this.column2Full1 = true;
                    alert("Нельзя добавить более 5 карточек во второй список");
                    return;
                }
            }
            if (this.column1Locked && this.progressTasks.length === 5 && completionPercentage >= 50) {
                this.column2Full1 = true;
            }
            if (completionPercentage >= 50 && this.plannedTasks.includes(card)) {
                this.column1Locked = true;
            }
            if (completionPercentage < 50 && this.progressTasks.includes(card) && this.plannedTasks.length < 3) {
                this.column1Locked = false;
            }
            if (this.column2Full1 === false && this.progressTasks.length < 5 && this.column2Full1 && this.plannedTasks.includes(card)) {
                this.moveCardToSecondColumn(card);
            }
            if (!this.column2Full1) {
                this.checkAndMoveCards();
            }
            if (completionPercentage >= 50 && this.completedTasks.includes(card)) {
                if (this.progressTasks.length < 5) {
                    const index = this.completedTasks.indexOf(card);
                    this.completedTasks.splice(index, 1);
                    this.progressTasks.push(card);
                } else {
                    alert("");
                    return;
                }
            }
            if (completionPercentage < 50 && this.progressTasks.includes(card) && this.plannedTasks.length < 3){
                const index1 = this.progressTasks.indexOf(card);
                this.progressTasks.splice(index1, 1);
                this.plannedTasks.push(card);
            }
            if (completionPercentage < 100) {
                card.completed = false;
            }
            if (completionPercentage === 100 && !this.completedTasks.includes(card)) {
                card.completed = true;
                card.lastCompleted = new Date().toLocaleString();
                if (this.progressTasks.includes(card)) {
                    this.progressTasks.splice(this.progressTasks.indexOf(card), 1);
                }
                this.completedTasks.push(card);
            } else if (completionPercentage === 100 && this.completedTasks.includes(card)) {
                card.lastCompleted = new Date().toLocaleString();
            } else {
                card.lastCompleted = "";
            }
            if (completionPercentage < 100 && this.completedTasks.includes(card)) {
                const index = this.completedTasks.indexOf(card);
                this.completedTasks.splice(index, 1);
                this.progressTasks.push(card);
            }

            //доп начало
            if (completionPercentage < 50 && this.progressTasks.includes(card) && this.plannedTasks.length === 3) {
                alert("AAAAAAAA");
                this.column2Locked = true;
            }
        },
        moveCardToSecondColumn(card) {
            const index = this.plannedTasks.indexOf(card);
            if (index !== -1) {
                this.plannedTasks.splice(index, 1);
                this.progressTasks.push(card);
            }
        },
        checkAndMoveCards() {
            for (let i = this.plannedTasks.length - 1; i >= 0; i--) {
                const card = this.plannedTasks[i];
                const checkedCount = card.items.filter(item => item.checked).length;
                const totalCount = card.items.length;
                const completionPercentage = (checkedCount / totalCount) * 100;

                if (completionPercentage >= 50) {
                    this.moveCardToSecondColumn(card);
                }
            }
        },
        updateItemText(card, item, newText) {
            if (this.column1Locked) {
                return;
            }

            item.text = newText;
        },
        saveData() {
            const data = {
                plannedTasks: this.plannedTasks,
                progressTasks: this.progressTasks,
                completedTasks: this.completedTasks
            };
            localStorage.setItem(storageKey, JSON.stringify(data));
        }
    },
    watch: {
        plannedTasks: {
            handler(newPlannedTasks) {
                this.saveData();
            },
            deep: true
        },
        progressTasks: {
            handler(newProgressTasks) {
                this.saveData();
            },
            deep: true
        },
        completedTasks: {
            handler(newCompletedTasks) {
                this.saveData();
            },
            deep: true
        }
    }
});
