import Rgb from "../Rgb";
import Palette from "./Palette";

export const palettes: Palette[] = [
    new Palette([
        new Rgb(0, 0, 0),
        new Rgb(255, 0, 0)
    ], "default_0"),
    new Palette([
        new Rgb(0, 255, 0),
        new Rgb(255, 0, 0)
    ], "default_1"),
    new Palette([
        new Rgb(0, 255, 255),
        new Rgb(255, 255, 0),
        new Rgb(255, 0, 255)
    ], "default_2")
];