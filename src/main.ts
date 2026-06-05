import './assets/style/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

const OPEN_SOURCE_BANNER = String.raw`
  ______ _ _      _____          _      ____            
 |  ____(_) |    / ____|        | |    |  _ \           
 | |__   _| | ___| |     ___   __| | ___| |_) | _____  __
 |  __| | | |/ _ \ |    / _ \ / _\` |/ _ \  _ < / _ \ \/ /
 | |    | | |  __/ |___| (_) | (_| |  __/ |_) | (_) >  < 
 |_|    |_|_|\___|\_____\___/ \__,_|\___|____/ \___/_/\_\

 Open Source: https://github.com/vastsa/FileCodeBox
`

console.info(OPEN_SOURCE_BANNER)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
