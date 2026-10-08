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
	{id: 'GoldenUnveil', file: 'golden-unveil.mp4', audio: true},
	// Earlier concepts (render with --only=...):
	{id: 'EveryPointCounts', file: 'every-point-counts/every-point-counts.mp4', audio: true, previous: true},
	{id: 'EveryPointCountsVertical', file: 'every-point-counts/every-point-counts-vertical-9x16.mp4', audio: true, previous: true},
	{id: 'Standby', file: 'previous/1-standby-loop.mp4', audio: false, previous: true},
	{id: 'CountdownReveal', file: 'previous/2-countdown-logo-reveal.mp4', audio: true, previous: true},
	{id: 'LogoLoop', file: 'previous/3-logo-hold-loop.mp4', audio: false, previous: true},
	{id: 'CountdownRevealVertical', file: 'previous/social-vertical-9x16.mp4', audio: true, previous: true},
];

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});

for (const job of JOBS.filter((j) => (only ? only.includes(j.id) : !j.previous))) {
	mkdirSync(path.dirname(path.join(OUT, job.file)), {recursive: true});
	const composition = await selectComposition({serveUrl, id: job.id, browserExecutable});
	const raw = path.join(TMP, `raw-${path.basename(job.file)}`);
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

if (!only) {
	const main = await selectComposition({serveUrl, id: 'GoldenUnveil', browserExecutable});
	await renderStill({serveUrl, composition: main, frame: main.durationInFrames - 1, output: path.join(OUT, 'logo-screen.png'), imageFormat: 'png', browserExecutable});
}
console.log('Done: renders/');
