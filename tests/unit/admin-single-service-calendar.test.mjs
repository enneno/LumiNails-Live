import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

// Exercise the real calendar collision resolver without changing its production exports.
const source = path.resolve('src/admin-reference');
const compiled = await build({
  entryPoints: [path.join(source, 'components/admin-week-calendar.tsx')], bundle: true,
  write: false, format: 'cjs', platform: 'node', jsx: 'automatic', logLevel: 'silent',
  alias: { '@': source }, external: ['react', 'react/jsx-runtime', 'react-dom', '@dnd-kit/*'], loader: { '.css': 'empty' },
  plugins: [{ name: 'calendar-behavior-test', setup(builder) {
    builder.onLoad({ filter: /\.css$/ }, () => ({ loader: 'js', contents: 'export default {};' }));
    builder.onLoad({ filter: /[\\/]admin-week-calendar\.tsx$/ }, args => ({ loader: 'tsx',
      contents: fs.readFileSync(args.path, 'utf8') + '\nexport {resolveNonOverlappingStart,resolveNonOverlappingBlockStart};' }));
  } }],
});
const module = { exports: {} };
vm.runInNewContext(compiled.outputFiles[0].text, { module, exports: module.exports, require: createRequire(import.meta.url), console, Date, Intl, setTimeout, clearTimeout });
const { resolveNonOverlappingStart, resolveNonOverlappingBlockStart } = module.exports;
const date = '2026-10-29';
const booking = (id, start, end, status = 'confirmed', day = date) => ({ id, dateInput: day, timeInput: start, endTime: end, status });

test('single calendar: moving an appointment respects every active booking and blocked interval', () => {
  const moving = booking(1, '09:00', '10:00');
  const bookings = [moving, booking(2, '10:00', '11:00'), booking(3, '08:00', '09:00', 'cancelled'), booking(4, '06:00', '22:00', 'confirmed', '2026-10-30')];
  const blocks = [{ id: 'block', exceptionId: 'blocked', dateInput: date, startMinutes: 540, endMinutes: 600 }];
  assert.equal(resolveNonOverlappingStart(moving, date, 570, 60, bookings, blocks), 480);
  assert.equal(resolveNonOverlappingStart(moving, date, 720, 60, bookings, blocks), 720);
  assert.equal(resolveNonOverlappingStart(moving, date, 570, 60, [moving], []), 570);
});

test('single calendar: moving a blocked interval respects bookings, other blocks and its own identity', () => {
  const moving = { id: 'own', exceptionId: 'own', dateInput: date, startMinutes: 540, endMinutes: 600 };
  const blocks = [moving, { id: 'other', exceptionId: 'other', dateInput: date, startMinutes: 660, endMinutes: 720 }];
  const bookings = [booking(2, '10:00', '11:00'), booking(3, '09:00', '10:00', 'guest_cancelled')];
  assert.equal(resolveNonOverlappingBlockStart(moving, date, 630, 60, bookings, blocks), 540);
  assert.equal(resolveNonOverlappingBlockStart(moving, date, 540, 60, bookings, blocks), 540);
  assert.equal(resolveNonOverlappingBlockStart(moving, '2026-10-30', 630, 60, bookings, blocks), 630);
});
