import { Component } from '@angular/core';
import { NavBar } from '../nav-bar/nav-bar';
import { Scene } from '../scene/scene';

@Component({
  selector: 'app-kaomoji',
  imports: [NavBar, Scene],
  templateUrl: './kaomoji.html',
  styleUrl: './kaomoji.css',
})
export class Kaomoji {}
