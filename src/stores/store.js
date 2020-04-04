import { createStore, action, computed, thunk } from 'easy-peasy';
import axios from 'axios';

const apiUrl = `${process.env.REACT_APP_CORS_PROXY || ""}${process.env.REACT_APP_APIURL}/${process.env.REACT_APP_STAGE}/`;

const recordsModel = {
    items: [],
    update: action((state, payload) => {
        state.items = payload;
    }),
    get: thunk(async (actions, payload) => {
        const result = await axios.get(apiUrl + 'record/list');
        actions.update(result.data);
    }),
    create: thunk(async (actions, payload) => {
        await axios.post(
            apiUrl + 'record/create', payload
        ).then(res => {
            alert('Your record has been created!');
            actions.get();
        }).catch(err => {
            console.error(err);
            alert('Something went wrong. Please try again later.');
        });
    }),

    // computed
    balance: computed(
        state => state.items.map(rec => rec.amount).reduce((a,b) => a + b, 0)
    ),
    income: computed(
        state => state.items.filter(rec => rec.type === "Income").map(rec => rec.amount).reduce((total,num) => total + num, 0)
    ),
    expenses: computed(
        state => state.items.filter(rec => rec.type === "Expense").map(rec => rec.amount).reduce((total,num) => total - num, 0)
    )
};

const categoriesModel = {
    items: [],
    update: action(async (state, payload) => {
        state.items = payload;
    }),
    get: thunk(async (actions, payload) => {
        const result = await axios.get(apiUrl + 'category/list');
        actions.update(result.data);
    }),
    create: thunk(async (actions, payload) => {
        await axios.post(
            apiUrl + 'category/create', payload
        ).then(res => {
            alert('New category has been created!');
            actions.get();
        }).catch(err => {
            console.error(err);
            alert('Something went wrong. Please try again later.');
        });
    })
};

const store = createStore({
    records: recordsModel,
    categories: categoriesModel
});

export default store;