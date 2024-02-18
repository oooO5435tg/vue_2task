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
            plannedTasks: [],
            progressTasks: [],
            completedTasks: [],
            editedTask: null,
            editedTaskIndex: null,
            editedColumn: null,
        }
    },
    methods: {
        addTask() {
            const newListItems = this.newList.map((listItem, index) => ({
                ...listItem,
                id: getUniqueId(`listItem-${this.newList.length}`),
                completed: false
            }));

            this.plannedTasks.push({
                ...this.newTask,
                lists: newListItems,
                completedListItems: newListItems.map(item => item.completed), // Initialize completedListItems based on completed property
                createdAt: new Date().toLocaleString(),
                lastChange: null
            });

            this.newTask = {
                title: '',
                description: '',
                deadline: '',
                createdAt: '',
                lastChange: null
            };
            this.newList = [
                { title: '', id: getUniqueId('newListItem') }
            ];
        },
    }
})