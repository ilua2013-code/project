import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// Вариант 1: Абсолютный путь
import { AppModule } from 'src/app/app.module';

// Вариант 2: Или так (если не работает первый)
// import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
