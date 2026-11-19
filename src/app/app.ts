import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Kaomoji } from './kaomoji/kaomoji';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Kaomoji],
  templateUrl: './app.html',
})
export class App {}
