import './styles/layout.css';
import './styles/dsky.css';
import './styles/lights.css';
import './styles/code.css';
import './styles/explorer.css';
import './styles/mobile.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia());
app.mount('#app');
