// Renders the Roamly "r" (Fraunces SemiBold) as PNGs and an SVG path.
// Usage (from the project root): swift scripts/app-icon.swift assets/fonts/Fraunces-SemiBold.ttf <outDir>
// Then copy the PNGs to assets/images/ and roamly-r.svg to assets/expo.icon/Assets/,
// and rebuild: npx expo prebuild --platform ios && npx expo run:ios.
import CoreGraphics
import CoreText
import Foundation
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let fontURL = URL(fileURLWithPath: args[1])
let outDir = URL(fileURLWithPath: args[2])

guard let descs = CTFontManagerCreateFontDescriptorsFromURL(fontURL as CFURL) as? [CTFontDescriptor],
      let desc = descs.first else { fatalError("font not readable") }
let font = CTFontCreateWithFontDescriptor(desc, 1000, nil)
var chars: [UniChar] = Array("r".utf16)
var glyphs = [CGGlyph](repeating: 0, count: 1)
guard CTFontGetGlyphsForCharacters(font, &chars, &glyphs, 1), let glyphPath = CTFontCreatePathForGlyph(font, glyphs[0], nil) else {
  fatalError("no glyph")
}
let box = glyphPath.boundingBoxOfPath

struct RGB { let r, g, b: CGFloat }
func hex(_ s: String) -> RGB {
  let v = Int(s, radix: 16)!
  return RGB(r: CGFloat((v >> 16) & 255) / 255, g: CGFloat((v >> 8) & 255) / 255, b: CGFloat(v & 255) / 255)
}

// Places the glyph so its height is `heightFraction` of the canvas, optically centered.
func placed(size: CGFloat, heightFraction: CGFloat) -> CGPath {
  let scale = (size * heightFraction) / box.height
  var t = CGAffineTransform.identity
  // Center the glyph's bounding box on the canvas (glyph space is y-up, like CG).
  t = t.translatedBy(x: size / 2, y: size / 2)
  t = t.scaledBy(x: scale, y: scale)
  t = t.translatedBy(x: -box.midX, y: -box.midY)
  return glyphPath.copy(using: &t)!
}

func png(_ name: String, size: Int, background: RGB?, glyph: RGB, heightFraction: CGFloat) {
  let s = CGFloat(size)
  let ctx = CGContext(data: nil, width: size, height: size, bitsPerComponent: 8, bytesPerRow: 0,
                      space: CGColorSpace(name: CGColorSpace.sRGB)!,
                      bitmapInfo: background == nil ? CGImageAlphaInfo.premultipliedLast.rawValue : CGImageAlphaInfo.noneSkipLast.rawValue)!
  if let bg = background {
    ctx.setFillColor(red: bg.r, green: bg.g, blue: bg.b, alpha: 1)
    ctx.fill(CGRect(x: 0, y: 0, width: s, height: s))
  }
  ctx.setFillColor(red: glyph.r, green: glyph.g, blue: glyph.b, alpha: 1)
  ctx.addPath(placed(size: s, heightFraction: heightFraction))
  ctx.fillPath()
  let url = outDir.appendingPathComponent(name)
  let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil)!
  CGImageDestinationAddImage(dest, ctx.makeImage()!, nil)
  CGImageDestinationFinalize(dest)
  print("wrote \(name) \(size)x\(size)")
}

// SVG of the glyph alone on a 1024 canvas (SVG is y-down, so flip).
func svg(_ name: String, color: String, heightFraction: CGFloat) {
  let size: CGFloat = 1024
  var flip = CGAffineTransform(a: 1, b: 0, c: 0, d: -1, tx: 0, ty: size)
  let path = placed(size: size, heightFraction: heightFraction).copy(using: &flip)!
  var d = ""
  path.applyWithBlock { el in
    let p = el.pointee.points
    func f(_ v: CGFloat) -> String { String(format: "%.2f", v) }
    switch el.pointee.type {
    case .moveToPoint: d += "M\(f(p[0].x)) \(f(p[0].y))"
    case .addLineToPoint: d += "L\(f(p[0].x)) \(f(p[0].y))"
    case .addQuadCurveToPoint: d += "Q\(f(p[0].x)) \(f(p[0].y)) \(f(p[1].x)) \(f(p[1].y))"
    case .addCurveToPoint: d += "C\(f(p[0].x)) \(f(p[0].y)) \(f(p[1].x)) \(f(p[1].y)) \(f(p[2].x)) \(f(p[2].y))"
    case .closeSubpath: d += "Z"
    @unknown default: break
    }
  }
  let doc = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1024 1024\" width=\"1024\" height=\"1024\"><path fill=\"#\(color)\" d=\"\(d)\"/></svg>\n"
  try! doc.write(to: outDir.appendingPathComponent(name), atomically: true, encoding: .utf8)
  print("wrote \(name)")
}

let forest = hex("2E6B45"), sand = hex("F2C36B"), white = hex("FFFFFF")

svg("roamly-r.svg", color: "F2C36B", heightFraction: 0.5)
png("icon.png", size: 1024, background: forest, glyph: sand, heightFraction: 0.5)
png("favicon.png", size: 48, background: forest, glyph: sand, heightFraction: 0.56)
png("splash-icon.png", size: 512, background: nil, glyph: sand, heightFraction: 0.9)
// Android adaptive: keep the mark inside the central safe zone (~66%), so ≈ 36% tall.
png("android-icon-foreground.png", size: 512, background: nil, glyph: sand, heightFraction: 0.36)
png("android-icon-background.png", size: 512, background: forest, glyph: forest, heightFraction: 0.01)
png("android-icon-monochrome.png", size: 432, background: nil, glyph: white, heightFraction: 0.36)
