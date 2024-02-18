new Vue({
    el: '#app',
    data(){
        return {
            newTask: {
                title: '',
            },
            newList: [
                { title: '' }
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

    }
})