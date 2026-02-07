import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// 1. ДОБАВЬТЕ этот импорт
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { TaskManagerComponent } from './task-manager/task-manager.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule, // <-- 2. ДОБАВЬТЕ ЭТУ СТРОКУ
    TaskManagerComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }