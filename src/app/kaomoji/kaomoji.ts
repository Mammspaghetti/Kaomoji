import { Component } from '@angular/core';
import { NavBar } from '../nav-bar/nav-bar';
import { Scene } from '../scene/scene';
import { SuccesPopup } from '../succes/succes-popup/succes-popup';

@Component({
  selector: 'app-kaomoji',
  imports: [NavBar, Scene, SuccesPopup],
  templateUrl: './kaomoji.html',
  styleUrl: './kaomoji.css',
})
export class Kaomoji {}
