// Final audio master: two-pass EBU R128 loudness normalisation (-16 LUFS, -1.5 dBTP).
// The video stream is copied untouched. Usage: node scripts/master.mjs <in.mp4> <out.mp4>
import {execFileSync, spawnSync} from 'node:child_process';

const [input, output] = process.argv.slice(2);
const target = 'I=-16:TP=-1.5:LRA=11';

// ffmpeg prints the loudnorm measurement JSON on stderr.
const pass1 = spawnSync('ffmpeg', ['-hide_banner', '-i', input, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-'], {
	encoding: 'utf8',
}).stderr;
const m = JSON.parse(pass1.slice(pass1.lastIndexOf('{')));
console.log(`measured: ${m.input_i} LUFS, ${m.input_tp} dBTP`);

const filter =
	`loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}` +
	`:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`;
execFileSync(
	'ffmpeg',
	['-hide_banner', '-loglevel', 'error', '-y', '-i', input, '-c:v', 'copy', '-af', filter, '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', output],
	{stdio: 'inherit'},
);
console.log(`mastered -> ${output}`);
