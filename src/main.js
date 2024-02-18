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
    methods: {
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
                completedListItems: newListItems.map(item => item.completed),
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
        saveData() {
            const data = {
                plannedTasks: this.plannedTasks,
                progressTasks: this.progressTasks,
                completedTasks: this.completedTasks
            };
            localStorage.setItem(storageKey, JSON.stringify(data));
        },
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
})