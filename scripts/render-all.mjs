// Renders the full ceremony package into renders/.
// Usage: node scripts/render-all.mjs [--only=Id,Id] [--browser-executable=/path/to/chrome]
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import path from 'node:path';

const browserExecutable = process.argv.find((a) => a.startsWith('--browser-executable='))?.split('=')[1] ?? null;
const only = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1]?.split(',');
const OUT = path.resolve('renders');
const TMP = path.resolve('out');
mkdirSync(OUT, {recursive: true});
mkdirSync(TMP, {recursive: true});

const JOBS = [
	{id: 'Standby', file: '1-standby-loop.mp4', audio: false},
	{id: 'CountdownReveal', file: '2-countdown-logo-reveal.mp4', audio: true},
	{id: 'LogoLoop', file: '3-logo-hold-loop.mp4', audio: false},
	{id: 'CountdownRevealVertical', file: 'social-vertical-9x16.mp4', audio: true},
];

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});

for (const job of JOBS.filter((j) => !only || only.includes(j.id))) {
	const composition = await selectComposition({serveUrl, id: job.id, browserExecutable});
	const raw = path.join(TMP, `raw-${job.file}`);
	console.log(`Rendering ${job.id} (${composition.durationInFrames} frames)…`);
	await renderMedia({
		serveUrl,
		composition,
		codec: 'h264',
		crf: 16,
		pixelFormat: 'yuv420p',
		imageFormat: 'jpeg',
		jpegQuality: 95,
		muted: !job.audio,
		audioCodec: 'aac',
		audioBitrate: '320k',
		outputLocation: job.audio ? raw : path.join(OUT, job.file),
		browserExecutable,
		concurrency: 4,
	});
	if (job.audio) {
		execFileSync('node', ['scripts/master.mjs', raw, path.join(OUT, job.file)], {stdio: 'inherit'});
	}
}

const logo = await selectComposition({serveUrl, id: 'LogoLoop', browserExecutable});
await renderStill({serveUrl, composition: logo, frame: 0, output: path.join(OUT, 'logo-screen.png'), imageFormat: 'png', browserExecutable});
console.log('Done: renders/');
