const storageKey = 'new';

const storageData = localStorage.getItem(storageKey);

const initialData = storageData ? JSON.parse(storageData) : {
    plannedTasks: [],
    progressTasks: [],
    completedTasks: []
};

function getUniqueId(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

new Vue({
    el: '#app',
    data(){
        return {
            newTask: {
                title: '',
            },
            newList: [
                { title: '', id: getUniqueId('newListItem') }
            ],
            plannedTasks: initialData.plannedTasks,
            progressTasks: initialData.progressTasks,
            completedTasks: initialData.completedTasks,
            editedTask: null,
            editedTaskIndex: null,
            editedColumn: null,
        }
    },
    methods:{
        addTask() {
            if (!this.newTask.title) {
                alert('Необходимо указать заголовок задачи');
                return;
            }
            if (!this.newTask.title || this.newList.some(listItem => !listItem.title)) {
                alert('Необходимо заполнить все списки');
                return;
            }
            if (this.newList.length < 3 || this.newList.length > 5) {
                alert('Количество списков должно быть в диапазоне от 3 до 5');
                return;
            }
            if (this.plannedTasks.length >= 3) {
                alert('Нельзя добавить более 3-х карточек в первый список');
                return;
            }

            const newListItems = this.newList.map((listItem, index) => ({
                ...listItem,
                id: getUniqueId(`listItem-${this.newList.length}`),
                completed: false
            }));

            this.plannedTasks.push({
                ...this.newTask,
                lists: newListItems,
                completedListItems: newListItems.map(item => item.completed), // Initialize completedListItems based on completed property
            });

            this.newTask = {
                title: '',
            };
            this.newList = [
                { title: '', id: getUniqueId('newListItem') }
            ];
        },
        removeTask(taskIndex) {
            this.plannedTasks.splice(taskIndex, 1);
        },
        addListItem() {
            if (this.newList.length < 5) {
                this.newList.push({ title: '', id: getUniqueId('newListItem') });
            }
        },
        autoMoveTask(taskIndex, column) {
            const task = column === 'planned' ? this.plannedTasks[taskIndex] : this.progressTasks[taskIndex];
            if (task === undefined) {
                return;
            }
            const completedListItemsCount = task.completedListItems.filter(Boolean).length;
            const totalListItemsCount = task.lists.length;
            const percentageCompleted = (completedListItemsCount / totalListItemsCount) * 100;

            if (percentageCompleted === 100) {
                if (column === 'planned') {
                    this.completedTasks.push(this.plannedTasks.splice(taskIndex, 1)[0]);
                    // Устанавливаем дату и время последнего отмеченного пункта
                    task.lastCompletedAt = new Date().toLocaleString();
                } else {
                    this.completedTasks.push(this.progressTasks.splice(taskIndex, 1)[0]);
                    // Устанавливаем дату и время последнего отмеченного пункта
                    task.lastCompletedAt = new Date().toLocaleString();
                }
            }
            else if (percentageCompleted >= 50) {
                if (column === 'planned') {
                    if (this.progressTasks.length >= 5){
                        alert('Нельзя добавить более 5-ти карточек во второй список');
                        // Блокируем редактирование первого столбца
                        this.editedTask = null;
                        this.editedTaskIndex = null;
                        this.editedColumn = null;
                    }
                    else{
                        this.progressTasks.push(this.plannedTasks.splice(taskIndex, 1)[0]);
                        // Проверяем, если удаляется карточка из первого столбца и он содержит задачи с процентом выполнения >= 50
                        if (this.plannedTasks.some(task => task.percentageCompleted >= 50)) {
                            this.progressTasks.unshift(this.plannedTasks.shift()); // Переносим первую задачу из первого столбца во второй
                            // Блокируем редактирование первого столбца
                            this.editedTask = null;
                            this.editedTaskIndex = null;
                            this.editedColumn = null;
                        }
                    }
                }
            }
            else if (percentageCompleted < 50) {
                if (column === 'progress') {
                    if (this.plannedTasks.length < 3) {
                        this.plannedTasks.push(this.progressTasks.splice(taskIndex, 1)[0]);
                    }
                    else {
                        alert("В 1 столбце уже есть 3 карточки!");
                    }
                }
            }
        },
        saveData() {
            const data = {
                plannedTasks: this.plannedTasks,
                progressTasks: this.progressTasks,
                completedTasks: this.completedTasks
            };
            localStorage.setItem(storageKey, JSON.stringify(data));
        },
    },
    computed: {
        // Вычисляемое свойство для отслеживания изменений во всех задачах в массиве plannedTasks
        plannedTasksWatcher() {
            return this.plannedTasks.map((task, index) => {
                return task.completedListItems.reduce((acc, val) => acc + (val ? 1 : 0), 0);
            });
        },
        // Вычисляемое свойство для отслеживания изменений во всех задачах в массиве progressTasks
        progressTasksWatcher() {
            return this.progressTasks.map((task, index) => {
                return task.completedListItems.reduce((acc, val) => acc + (val ? 1 : 0), 0);
            });
        }
    },
    watch: {
        plannedTasksWatcher: {
            deep: true,
            handler(newVal, oldVal) {
                newVal.forEach((count, index) => {
                    this.autoMoveTask(index, 'planned');
                });
            }
        },
        progressTasksWatcher: {
            deep: true,
            handler(newVal, oldVal) {
                newVal.forEach((count, index) => {
                    this.autoMoveTask(index, 'progress');
                });
            }
        },
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
})