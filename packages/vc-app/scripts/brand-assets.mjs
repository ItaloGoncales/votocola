import sharp from 'sharp';
// Gera os ícones, splash, favicon e a marca do app a partir do logo (urna à esquerda).
// Uso: yarn app brand [logo.png]  (padrão: assets/brand/logo-original.png)
// Se o logo mudar de proporção, ajuste o recorte da urna em `extract`.
const SRC = process.argv[2] ?? 'assets/brand/logo-original.png';
const OUT = 'assets/brand';
const CANVAS = { r: 0x14, g: 0x10, b: 0x36, alpha: 1 };
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };
// Urna recortada (fundo já transparente), com folga para não cortar a sombra.
const mark = await sharp(SRC)
  .extract({ left: 28, top: 335, width: 324, height: 324 })
  .png()
  .toBuffer();
const sized = (px) => sharp(mark).resize(px, px, { kernel: 'lanczos3' }).png().toBuffer();
const onto = async (size, px, background) =>
  sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: await sized(px), gravity: 'center' }])
    .png();

// Ícone iOS/geral: fundo do app, urna com margem (o iOS arredonda os cantos).
await (
  await onto(1024, 700, CANVAS)
)
  .flatten({ background: CANVAS })
  .removeAlpha()
  .toFile(`${OUT}/icon.png`);
// Android adaptativo: só a urna, dentro da zona segura (~66% central); o fundo vem do app.json.
await (await onto(1024, 560, CLEAR)).toFile(`${OUT}/android-adaptive-foreground.png`);
// Monocromático (Android 13+): silhueta branca; tela e teclas escuras vazadas, check visível.
{
  const { data, info } = await (
    await onto(1024, 560, CLEAR)
  )
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const keep = data[i + 3] > 40 && Math.max(data[i], data[i + 1], data[i + 2]) > 128;
    data[i] = data[i + 1] = data[i + 2] = 255;
    data[i + 3] = keep ? data[i + 3] : 0;
  }
  await sharp(data, { raw: info }).png().toFile(`${OUT}/android-adaptive-monochrome.png`);
}
// Splash: urna transparente sobre o fundo do splash (#141036, no app.json).
await (await onto(1024, 1000, CLEAR)).toFile(`${OUT}/splash-icon.png`);
// Favicon e marca usada dentro do app (3x para telas densas).
await (await onto(64, 60, CLEAR)).toFile(`${OUT}/favicon.png`);
await sharp(await sized(216)).toFile(`${OUT}/mark.png`);
console.log('Assets gerados em', OUT);
