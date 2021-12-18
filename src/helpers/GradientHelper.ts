import { hsv2Rgb, rgb_to_hsv } from "colorsys";
import Rgb from "../models/Rgb";
import Hsv from "../models/Hsv";
import { HsvLerp } from "./HsvHelper";
import { Lerp } from "./MathHelper";

export function InterpolateHsv(colours: Hsv[], t: number): Hsv {
    const segments = colours.length - 1;
    const segmentRatio = 1 / segments;

    // Get the index of the current segment (starting at 0).
    const currentSegment = Math.floor(t / segmentRatio);

    // Get the factor along this segment that t represents.
    const tSegment = (t % segmentRatio) / segmentRatio;

    return InterpolateHsvSingle(colours[currentSegment], colours[currentSegment + 1], tSegment);
}

function InterpolateHsvSingle(a: Hsv, b: Hsv, t: number): Hsv {
    return HsvLerp(a, b, t);
}

export function InterpolateRgb(colours: Hsv[], t: number): Hsv {
    const segments = colours.length - 1;
    const segmentRatio = 1 / segments;

    // Get the index of the current segment (starting at 0).
    const currentSegment = Math.floor(t / segmentRatio);

    // Get the factor along this segment that t represents.
    const tSegment = (t % segmentRatio) / segmentRatio;

    return rgb_to_hsv(InterpolateRgbSingle(hsv2Rgb(colours[currentSegment].h, colours[currentSegment].s, colours[currentSegment].v),
        hsv2Rgb(colours[currentSegment + 1].h, colours[currentSegment + 1].s, colours[currentSegment + 1].v),
        tSegment));
}

export function InterpolateRgbRaw(colours: Rgb[], t: number): Rgb {
    const segments = colours.length - 1;
    const segmentRatio = 1 / segments;

    // Get the index of the current segment (starting at 0).
    const currentSegment = Math.floor(t / segmentRatio);

    // Get the factor along this segment that t represents.
    const tSegment = (t % segmentRatio) / segmentRatio;

    return InterpolateRgbSingle(colours[currentSegment], colours[currentSegment + 1], tSegment);
}

export function InterpolateRgbSingle(a: Rgb, b: Rgb, t: number): Rgb {
    const rgb = new Rgb(
        Lerp(a.r, b.r, t),
        Lerp(a.g, b.g, t),
        Lerp(a.b, b.b, t),
    );

    // console.log(`r: ${rgb.r}, g: ${rgb.g}, b: ${rgb.b}, t: ${t}`);
    return rgb;
}

export function InterpolateHsvShort(colours: Hsv[], t: number): Hsv {
    const segments = colours.length - 1;
    const segmentRatio = 1 / segments;

    // Get the index of the current segment (starting at 0).
    const currentSegment = Math.floor(t / segmentRatio);

    // Get the factor along this segment that t represents.
    const tSegment = (t % segmentRatio) / segmentRatio;

    return InterpolateHsvShortSingle(colours[currentSegment], colours[currentSegment + 1], tSegment);
}

function InterpolateHsvShortSingle(a: Hsv, b: Hsv, t: number): Hsv {
    return new Hsv(
        interpolateHueShort(a.h, b.h, t),
        Lerp(a.s, b.s, t),
        Lerp(a.v, b.v, t),
    );
}

export function InterpolateHsvLong(colours: Hsv[], t: number): Hsv {
    const segments = colours.length - 1;
    const segmentRatio = 1 / segments;

    // Get the index of the current segment (starting at 0).
    const currentSegment = Math.floor(t / segmentRatio);

    // Get the factor along this segment that t represents.
    const tSegment = (t % segmentRatio) / segmentRatio;

    return InterpolateHsvShortLong(colours[currentSegment], colours[currentSegment + 1], tSegment);
}

function InterpolateHsvShortLong(a: Hsv, b: Hsv, t: number): Hsv {
    return new Hsv(
        interpolateHueLong(a.h, b.h, t),
        Lerp(a.s, b.s, t),
        Lerp(a.v, b.v, t),
    );
}

function interpolateHueShort(a: number, b: number, t: number): number {
    if (b - a > 180) {
        a += 360;
    } else if (a - b > 180) {
        b += 360;
    }

    return Lerp(a, b, t) % 360;
}

function interpolateHueLong(a: number, b: number, t: number): number {
    if (b - a <= 180 && b - a >= 0) {
        a += 360;
    } else if (a - b <= 180 && a - b >= 0) {
        b += 360;
    }

    return Lerp(a, b, t) % 360;
}